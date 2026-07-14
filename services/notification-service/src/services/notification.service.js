const { genId } = require('@freshmart/service-shared').utils.id;
const { BadRequestError, NotFoundError } = require('@freshmart/service-shared').errors;
const sharedLogger = require('@freshmart/service-shared').logger;
const notificationRepository = require('../repositories/notification.repository');
const snsService = require('@freshmart/service-shared').integrations.sns;
const sqsService = require('@freshmart/service-shared').integrations.sqs;
const {
  publishNotificationCreated,
  publishNotificationDelivered,
  publishNotificationFailed,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'notification-service' });

const buildMessage = ({ title, body, eventType, recipient }) => ({
  title,
  body,
  eventType,
  recipient,
});

const resolveRecipient = (payload = {}, fallbackUserId = 'SYSTEM') => {
  const user = payload.user || payload.order || payload.payment || payload.inventory || payload;
  return {
    userId: user.userId || fallbackUserId,
    email: user.email || user.userEmail || null,
    phone: user.phone || null,
  };
};

const createAndDeliverNotification = async ({
  type,
  eventType,
  subject,
  message,
  payload = {},
  status = 'QUEUED',
  context = {},
  userId = null,
  recipient = null,
}) => {
  const resolvedRecipient = recipient || resolveRecipient(payload, userId || 'SYSTEM');
  const notification = await notificationRepository.create({
    notificationId: genId('NOTIF'),
    userId: resolvedRecipient.userId || userId || 'SYSTEM',
    type,
    channel: 'SNS',
    subject,
    message,
    payload,
    status,
    eventType,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  await publishNotificationCreated({ notification }, { ...context, source: 'notification-service' });

  const snsPayload = {
    notificationId: notification.notificationId,
    userId: notification.userId,
    eventType,
    subject,
    message,
    recipient: resolvedRecipient,
    payload,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  };

  try {
    await snsService.publishNotification(snsPayload);
    const delivered = await notificationRepository.updateStatus(notification.notificationId, 'DELIVERED', {
      deliveredAt: new Date().toISOString(),
    });
    await publishNotificationDelivered({ notification: delivered }, { ...context, source: 'notification-service' });
    return delivered;
  } catch (error) {
    const failed = await notificationRepository.updateStatus(notification.notificationId, 'FAILED', {
      failureReason: error.message,
    });
    await publishNotificationFailed({ notification: failed, error: error.message }, { ...context, source: 'notification-service' });
    await sqsService.enqueueNotificationRetry({
      notificationId: notification.notificationId,
      userId: notification.userId,
      eventType,
      subject,
      message,
      payload,
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      failureReason: error.message,
    });
    return failed;
  }
};

const handleUserRegisteredEvent = async (payload = {}, context = {}) => {
  const user = payload.user || payload;
  if (!user?.userId || !user?.email) {
    throw new BadRequestError("Invalid payload for 'UserRegistered'. Missing required field(s): user.userId, user.email");
  }

  logger.info('Processing user registration notification', {
    userId: user.userId,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  return createAndDeliverNotification({
    type: 'WELCOME',
    eventType: 'UserRegistered.v1',
    subject: 'Welcome to FreshMart',
    message: `Welcome ${user.name || 'there'}! Your FreshMart account is ready.`,
    payload,
    context,
    userId: user.userId,
    recipient: { userId: user.userId, email: user.email, phone: user.phone || null },
  });
};

const handleOrderAcceptedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderAccepted'. Missing required field: order.orderId");
  }
  return createAndDeliverNotification({
    type: 'ORDER_ACCEPTED',
    eventType: 'OrderAccepted.v1',
    subject: `Order ${order.orderId} accepted`,
    message: `Your order ${order.orderId} has been accepted and is being prepared.`,
    payload,
    context,
    userId: order.userId || 'SYSTEM',
    recipient: resolveRecipient(order, order.userId || 'SYSTEM'),
  });
};

const handleOrderReadyEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderReady'. Missing required field: order.orderId");
  }
  return createAndDeliverNotification({
    type: 'ORDER_READY',
    eventType: 'OrderReady.v1',
    subject: `Order ${order.orderId} is ready`,
    message: `Your order ${order.orderId} is ready for pickup.`,
    payload,
    context,
    userId: order.userId || 'SYSTEM',
    recipient: resolveRecipient(order, order.userId || 'SYSTEM'),
  });
};

const handleOrderCompletedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderCompleted'. Missing required field: order.orderId");
  }
  return createAndDeliverNotification({
    type: 'ORDER_COMPLETED',
    eventType: 'OrderCompleted.v1',
    subject: `Order ${order.orderId} completed`,
    message: `Your order ${order.orderId} has been completed.`,
    payload,
    context,
    userId: order.userId || 'SYSTEM',
    recipient: resolveRecipient(order, order.userId || 'SYSTEM'),
  });
};

const handlePaymentSuccessEvent = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload;
  if (!payment?.paymentId || !payment?.orderId) {
    throw new BadRequestError("Invalid payload for 'PaymentSuccess'. Missing required field(s): payment.paymentId, payment.orderId");
  }
  return createAndDeliverNotification({
    type: 'PAYMENT_SUCCESS',
    eventType: 'PaymentSuccess.v1',
    subject: `Payment received for order ${payment.orderId}`,
    message: `Payment ${payment.paymentId} was successful.`,
    payload,
    context,
    userId: payment.userId || 'SYSTEM',
    recipient: resolveRecipient(payment, payment.userId || 'SYSTEM'),
  });
};

const handleInventoryLowEvent = async (payload = {}, context = {}) => {
  const inventory = payload.inventory || payload;
  if (!inventory?.productId && !inventory?.foodId) {
    throw new BadRequestError("Invalid payload for 'InventoryLow'. Missing required field: inventory.productId");
  }
  return createAndDeliverNotification({
    type: 'INVENTORY_LOW',
    eventType: 'InventoryLow.v1',
    subject: `Inventory low for ${inventory.productId || inventory.foodId}`,
    message: `Inventory for product ${inventory.productId || inventory.foodId} is running low.`,
    payload,
    context,
    userId: inventory.userId || 'ADMIN',
    recipient: { userId: inventory.userId || 'ADMIN', email: inventory.adminEmail || null, phone: null },
  });
};

const handleInventoryOutOfStockEvent = async (payload = {}, context = {}) => {
  const inventory = payload.inventory || payload;
  if (!inventory?.productId && !inventory?.foodId) {
    throw new BadRequestError("Invalid payload for 'InventoryOutOfStock'. Missing required field: inventory.productId");
  }
  return createAndDeliverNotification({
    type: 'INVENTORY_OUT_OF_STOCK',
    eventType: 'InventoryOutOfStock.v1',
    subject: `Inventory out of stock for ${inventory.productId || inventory.foodId}`,
    message: `Product ${inventory.productId || inventory.foodId} is out of stock.`,
    payload,
    context,
    userId: inventory.userId || 'ADMIN',
    recipient: { userId: inventory.userId || 'ADMIN', email: inventory.adminEmail || null, phone: null },
  });
};

const listNotifications = async ({ userId = null, status = null } = {}) => {
  if (userId) {
    const items = await notificationRepository.listByUser(userId);
    return status ? items.filter((item) => item.status === status) : items;
  }
  if (status) {
    return notificationRepository.listByStatus(status);
  }
  throw new BadRequestError('Either userId or status is required');
};

const getNotificationById = async (notificationId) => {
  const notification = await notificationRepository.findById(notificationId);
  if (!notification) {
    throw new NotFoundError(`Notification '${notificationId}' not found`);
  }
  return notification;
};

const markDelivered = async (notificationId, context = {}) => {
  const notification = await notificationRepository.updateStatus(notificationId, 'DELIVERED', {
    deliveredAt: new Date().toISOString(),
  });
  if (!notification) throw new NotFoundError(`Notification '${notificationId}' not found`);
  await publishNotificationDelivered({ notification }, { ...context, source: 'notification-service' });
  return notification;
};

const markFailed = async (notificationId, failureReason, context = {}) => {
  const notification = await notificationRepository.updateStatus(notificationId, 'FAILED', {
    failureReason: failureReason || 'Manual failure',
  });
  if (!notification) throw new NotFoundError(`Notification '${notificationId}' not found`);
  await publishNotificationFailed({ notification, failureReason }, { ...context, source: 'notification-service' });
  return notification;
};

module.exports = {
  buildMessage,
  resolveRecipient,
  createAndDeliverNotification,
  handleUserRegisteredEvent,
  handleOrderAcceptedEvent,
  handleOrderReadyEvent,
  handleOrderCompletedEvent,
  handlePaymentSuccessEvent,
  handleInventoryLowEvent,
  handleInventoryOutOfStockEvent,
  listNotifications,
  getNotificationById,
  markDelivered,
  markFailed,
};
