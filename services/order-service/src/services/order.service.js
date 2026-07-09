const { genId } = require('@freshmart/shared').utils.id;
const { NotFoundError, BadRequestError, ForbiddenError } = require('@freshmart/shared').errors;
const { buildMeta } = require('@freshmart/shared').utils.pagination;
const { ORDER_STATUS, CUSTOMER_CANCELLABLE_STATUSES, ROLES } = require('@freshmart/shared').constants;
const sharedLogger = require('@freshmart/shared').logger;
const orderRepository = require('../repositories/order.repository');
const cartRepository = require('@freshmart/cart-service/src/repositories/cart.repository');
const cartService = require('@freshmart/cart-service/src/services/cart.service');
const inventoryService = require('@freshmart/inventory-service/src/services/inventory.service');
const {
  publishOrderPlaced,
  publishOrderAccepted,
  publishOrderCancelled,
  publishOrderReady,
  publishOrderCompleted,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'order-service' });

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PLACED]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED, ORDER_STATUS.READY],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

const assertOwnership = (order, userId) => {
  if (order.userId !== userId) {
    throw new ForbiddenError('You do not have access to this order');
  }
};

const requireCart = async (userId) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    throw new BadRequestError('Cart is empty — add items before placing an order');
  }
  const totals = await cartService.recalculateTotals(cart.cartId, userId);
  if (!totals.items.length) {
    throw new BadRequestError('Cart is empty — add items before placing an order');
  }
  return { cart, totals };
};

const validateInventory = async (items) => {
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await inventoryService.validateStockForOrderInConn(null, {
      productId: item.productId,
      quantity: item.quantity,
    });
  }
};

const deductInventory = async (items, context = {}) => {
  const deducted = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const updated = await inventoryService.decreaseStock(
      item.productId,
      { amount: item.quantity },
      { ...context, source: 'order-service' }
    );
    deducted.push({ productId: item.productId, quantity: item.quantity, snapshot: updated });
  }
  return deducted;
};

const restoreInventory = async (items, context = {}) => {
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await inventoryService.increaseStock(
      item.productId,
      { amount: item.quantity },
      { ...context, source: 'order-service', reason: 'order-rollback' }
    );
  }
};

const buildOrderResponse = (order) => order;

const placeOrderFromCart = async (userId, { pickupTime } = {}, context = {}) => {
  const { cart, totals } = await requireCart(userId);
  const items = totals.items.map((item) => ({
    productId: item.productId,
    productName: item.productName || item.name,
    quantity: Number(item.quantity),
    price: Number(item.price),
    imageUrl: item.imageUrl || null,
    lineTotal: Number(item.lineTotal),
  }));

  await validateInventory(items);
  const deducted = await deductInventory(items, context);

  const orderId = genId('ORDER');
  const orderPayload = {
    orderId,
    userId,
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    discount: 0,
    totalAmount: totals.totalAmount,
    paymentStatus: 'PENDING',
    orderStatus: ORDER_STATUS.PLACED,
    pickupTime: pickupTime || null,
  };

  let createdOrder;
  try {
    createdOrder = await orderRepository.create(orderPayload);
    await cartService.clearCart(userId, context);
  } catch (error) {
    logger.warn('Rolling back order placement after downstream failure', {
      orderId,
      error: error.message,
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
    });
    try {
      await restoreInventory(deducted, context);
    } catch (restoreError) {
      logger.error('Inventory rollback failed after order placement failure', {
        orderId,
        error: restoreError.message,
      });
    }
    if (createdOrder) {
      await orderRepository.deleteOrder(orderId).catch(() => null);
    }
    throw error;
  }

  await publishOrderPlaced({ order: buildOrderResponse(createdOrder) }, { ...context, source: 'order-service' });
  return buildOrderResponse(createdOrder);
};

const getOrderById = async (orderId, requestingUser) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError(`Order '${orderId}' not found`);
  if (requestingUser.role === ROLES.CUSTOMER) {
    assertOwnership(order, requestingUser.userId);
  }
  return buildOrderResponse(order);
};

const getUserOrders = async (userId, { page, limit, orderStatus }) => {
  const { items, total } = await orderRepository.findByUser(userId, { page, limit, orderStatus });
  return { items: items.map(buildOrderResponse), meta: buildMeta({ page: page || 1, limit: limit || 20, total }) };
};

const getAllOrdersAdmin = async ({ page, limit, orderStatus }) => {
  const { items, total } = await orderRepository.findAllAdmin({ page, limit, orderStatus });
  return { items: items.map(buildOrderResponse), meta: buildMeta({ page: page || 1, limit: limit || 20, total }) };
};

const updateOrderStatus = async (orderId, newStatus, context = {}) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError(`Order '${orderId}' not found`);

  const allowed = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot move order from '${order.orderStatus}' to '${newStatus}'. Allowed next states: ${
        allowed.length ? allowed.join(', ') : 'none (terminal state)'
      }`
    );
  }

  const updatedOrder = await orderRepository.updateOrderStatus(orderId, newStatus);
  if (!updatedOrder) throw new NotFoundError(`Order '${orderId}' not found`);

  if (newStatus === ORDER_STATUS.ACCEPTED) {
    await publishOrderAccepted({ order: updatedOrder }, { ...context, source: 'order-service' });
  } else if (newStatus === ORDER_STATUS.READY) {
    await publishOrderReady({ order: updatedOrder }, { ...context, source: 'order-service' });
  } else if (newStatus === ORDER_STATUS.DELIVERED) {
    await publishOrderCompleted({ order: updatedOrder }, { ...context, source: 'order-service' });
  } else if (newStatus === ORDER_STATUS.CANCELLED) {
    await publishOrderCancelled({ order: updatedOrder }, { ...context, source: 'order-service' });
  }

  return updatedOrder;
};

const cancelOrder = async (orderId, requestingUser, context = {}) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError(`Order '${orderId}' not found`);

  if (requestingUser.role === ROLES.CUSTOMER) {
    assertOwnership(order, requestingUser.userId);
    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      throw new BadRequestError(
        `Order can no longer be cancelled (current status: '${order.orderStatus}'). Please contact FreshMart support.`
      );
    }
  }

  const updatedOrder = await updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, context);
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    // TODO: Remove after Payment Service migration.
    await inventoryService.increaseStock(
      item.productId || item.foodId,
      { amount: item.quantity },
      { ...context, source: 'order-service', reason: 'order-cancelled' }
    );
  }
  return updatedOrder;
};

const syncPaymentStatus = async (orderId, paymentStatus) =>
  orderRepository.updatePaymentStatus(orderId, paymentStatus);

const handleInventoryUpdated = async (payload = {}, context = {}) => {
  const inventory = payload.inventory || payload;
  // TODO: Remove after Payment Service migration.
  logger.info('Observed InventoryUpdated event', {
    productId: inventory?.productId || inventory?.foodId || null,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });
  // TODO: Remove after Payment Service migration.
  return { productId: inventory?.productId || inventory?.foodId || null };
};

const handlePaymentSuccess = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment?.orderId) {
    throw new BadRequestError("Invalid payload for 'PaymentSuccess'. Missing required field: payment.orderId");
  }
  const updated = await syncPaymentStatus(payment.orderId, 'SUCCESS');
  return { orderId: payment.orderId, order: updated, status: 'SUCCESS' };
};

const handlePaymentFailed = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment?.orderId) {
    throw new BadRequestError("Invalid payload for 'PaymentFailed'. Missing required field: payment.orderId");
  }
  const updated = await syncPaymentStatus(payment.orderId, 'FAILED');
  return { orderId: payment.orderId, order: updated, status: 'FAILED' };
};

module.exports = {
  placeOrderFromCart,
  getOrderById,
  getUserOrders,
  getAllOrdersAdmin,
  updateOrderStatus,
  cancelOrder,
  syncPaymentStatus,
  handleInventoryUpdated,
  handlePaymentSuccess,
  handlePaymentFailed,
  ALLOWED_TRANSITIONS,
};
