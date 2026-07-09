const config = require('@freshmart/shared').config;
const { genId } = require('@freshmart/shared').utils.id;
const { NotFoundError, BadRequestError } = require('@freshmart/shared').errors;
const sharedLogger = require('@freshmart/shared').logger;
const cartRepository = require('../repositories/cart.repository');
const {
  publishCartItemAdded,
  publishCartItemUpdated,
  publishCartItemRemoved,
  publishCartCleared,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'cart-service' });

const round2 = (n) => Math.round(Number(n) * 100) / 100;

const safePublish = async (publishFn, payload, context, eventName) => {
  try {
    await publishFn(payload, { ...context, source: 'cart-service' });
  } catch (err) {
    logger.warn(`Event publish failed: ${eventName}`, {
      service: 'cart-service',
      eventName,
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      error: err.message,
    });
  }
};

const buildCartResponse = (cart, items = []) => {
  if (!cart) return null;
  return {
    cartId: cart.cartId,
    userId: cart.userId,
    items,
    subtotal: round2(cart.subtotal || 0),
    tax: round2(cart.tax || 0),
    totalAmount: round2(cart.totalAmount || 0),
    taxPercentage: config.order.taxPercentage,
  };
};

const recalculateTotals = async (cartId, userId = null) => {
  const cart = userId
    ? await cartRepository.findCartByUserId(userId)
    : await cartRepository.findCartById(cartId);

  if (!cart) {
    return buildCartResponse({ cartId, userId, subtotal: 0, tax: 0, totalAmount: 0 }, []);
  }

  const items = await cartRepository.findItems(cart.cartId, cart.userId);
  const subtotal = round2(items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0));
  const tax = round2(subtotal * (config.order.taxPercentage / 100));
  const totalAmount = round2(subtotal + tax);
  await cartRepository.updateTotals(cart.cartId, cart.userId, { subtotal, tax, totalAmount });
  return buildCartResponse({ ...cart, subtotal, tax, totalAmount }, items);
};

const getCart = async (userId) => {
  const cart = await cartRepository.getOrCreateCart(genId('CART'), userId);
  return recalculateTotals(cart.cartId, userId);
};

// Product snapshot fields (price, productName, imageUrl, available) are provided
// by the caller from the product API response. Cart-service does not call the
// product table directly — each service owns its own data.
const addItem = async (userId, { productId, quantity = 1, price, productName, imageUrl, available = true }, context = {}) => {
  const requestedQty = Number(quantity);
  if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
    throw new BadRequestError('quantity must be greater than zero');
  }

  if (!price || Number(price) <= 0) {
    throw new BadRequestError('price is required and must be greater than zero');
  }

  if (!available) {
    throw new BadRequestError(`Product '${productId}' is currently unavailable`);
  }

  const cart = await cartRepository.getOrCreateCart(genId('CART'), userId);
  const existing = await cartRepository.findItem(cart.cartId, userId, productId);

  const item = await cartRepository.upsertItem({
    cartItemId: existing?.cartItemId || genId('CITEM'),
    cartId: cart.cartId,
    userId,
    productId,
    quantity: requestedQty,
    price: Number(price),
    productName: productName || null,
    imageUrl: imageUrl || null,
    available: !!available,
  });

  const result = await recalculateTotals(cart.cartId, userId);
  const publisher = existing ? publishCartItemUpdated : publishCartItemAdded;
  await safePublish(publisher, { cart: result, item }, context, existing ? 'CART_ITEM_UPDATED' : 'CART_ITEM_ADDED');
  return result;
};

const updateItemQuantity = async (userId, productId, quantity, context = {}) => {
  const requestedQty = Number(quantity);
  if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
    throw new BadRequestError('quantity must be greater than zero');
  }

  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) throw new NotFoundError('Cart is empty');

  const existing = await cartRepository.findItem(cart.cartId, userId, productId);
  if (!existing) throw new NotFoundError(`Item '${productId}' not in cart`);

  const item = await cartRepository.setItemQuantity(cart.cartId, userId, productId, requestedQty);
  const result = await recalculateTotals(cart.cartId, userId);
  await safePublish(publishCartItemUpdated, { cart: result, item }, context, 'CART_ITEM_UPDATED');
  return result;
};

const removeItem = async (userId, productId, context = {}) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) throw new NotFoundError('Cart is empty');

  const removed = await cartRepository.removeItem(cart.cartId, userId, productId);
  if (!removed) throw new NotFoundError(`Item '${productId}' not in cart`);

  const result = await recalculateTotals(cart.cartId, userId);
  await safePublish(publishCartItemRemoved, { cart: result, productId }, context, 'CART_ITEM_REMOVED');
  return result;
};

const clearCart = async (userId, context = {}) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) throw new NotFoundError('Cart is empty');

  const items = await cartRepository.findItems(cart.cartId, userId);
  await cartRepository.clearItems(cart.cartId, userId);
  const result = await recalculateTotals(cart.cartId, userId);
  await safePublish(publishCartCleared, { cart: result, removedItems: items.length }, context, 'CART_CLEARED');
  return result;
};

// Event handlers consumed by Lambda event consumers.
const handleInventoryUpdated = async (payload = {}, context = {}) => {
  // TODO: Remove after Order Service migration.
  const inventory = payload.inventory || payload;
  const id = inventory?.productId || inventory?.foodId;
  if (!inventory || !id) {
    throw new BadRequestError("Invalid payload for 'InventoryUpdated'. Missing required field: inventory.productId");
  }

  const available = Number(inventory.currentStock ?? inventory.availableStock ?? 0) > 0;
  const items = await cartRepository.findItemsByProductId(id);
  const affected = [];

  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const updated = await cartRepository.updateItemAvailability(item.cartId, item.userId, item.productId, available);
    if (updated) affected.push(updated);
  }

  logger.info('Cart inventory sync handled', {
    productId: id,
    affectedItems: affected.length,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  return { productId: id, affectedItems: affected.length };
};

const handleProductAvailabilityChanged = async (payload = {}, context = {}) => {
  const product = payload.product || payload;
  // TODO: Remove after Order Service migration.
  const id = product?.productId || product?.foodId;
  if (!product || !id) {
    throw new BadRequestError("Invalid payload for 'ProductAvailabilityChanged'. Missing required field: product.productId");
  }

  logger.info('Cart product availability sync handled', {
    productId: id,
    available: !!product.available,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  const items = await cartRepository.findItemsByProductId(id);
  const affected = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const updated = await cartRepository.updateItemAvailability(item.cartId, item.userId, item.productId, !!product.available);
    if (updated) affected.push(updated);
  }

  return { productId: id, affectedItems: affected.length };
};

const handleProductDeleted = async (payload = {}, context = {}) => {
  // TODO: Remove after Order Service migration.
  const productId = payload.productId || payload.product?.productId || payload.foodId;
  if (!productId) {
    throw new BadRequestError("Invalid payload for 'ProductDeleted'. Missing required field: productId");
  }

  logger.info('Cart product deletion sync handled', {
    productId,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  const items = await cartRepository.findItemsByProductId(productId);
  const affectedCartIds = new Set();

  for (const item of items) {
    affectedCartIds.add(`${item.userId}:${item.cartId}`);
    // eslint-disable-next-line no-await-in-loop
    await cartRepository.removeItem(item.cartId, item.userId, item.productId);
  }

  for (const cartKey of affectedCartIds) {
    const [uid, cid] = cartKey.split(':');
    // eslint-disable-next-line no-await-in-loop
    await recalculateTotals(cid, uid);
  }

  return { productId, removedItems: items.length };
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  recalculateTotals,
  handleInventoryUpdated,
  handleProductAvailabilityChanged,
  handleProductDeleted,
  // TODO: Remove after Order Service migration.
  handleFoodAvailabilityChanged: handleProductAvailabilityChanged,
  // TODO: Remove after Order Service migration.
  handleFoodDeleted: handleProductDeleted,
};
