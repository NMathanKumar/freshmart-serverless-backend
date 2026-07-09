const { genId } = require('@freshmart/shared').utils.id;
const { NotFoundError, BadRequestError, ForbiddenError } = require('@freshmart/shared').errors;
const { PAYMENT_STATUS, PAYMENT_METHOD, ROLES } = require('@freshmart/shared').constants;
const sharedLogger = require('@freshmart/shared').logger;
const paymentRepository = require('../repositories/payment.repository');
const orderRepository = require('@freshmart/order-service/src/repositories/order.repository');
const {
  publishPaymentCreated,
  publishPaymentSuccess,
  publishPaymentFailed,
  publishPaymentRefunded,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'payment-service' });

const dummyGateway = {
  initiate: async () => ({ gatewayRef: genId('TXN') }),
  confirm: async (gatewayRef) => ({ success: true, transactionId: gatewayRef }),
  refund: async (transactionId) => ({ success: true, refundRef: `RFD_${transactionId}` }),
};

const isRetryableConflict = (error) =>
  error?.code === 'CONFLICT' ||
  error?.name === 'ConditionalCheckFailedException' ||
  error?.Code === 'ConditionalCheckFailedException';

const assertOwnership = (payment, requestingUser) => {
  if (requestingUser.role === ROLES.CUSTOMER && payment.userId !== requestingUser.userId) {
    throw new ForbiddenError('You do not have access to this payment');
  }
};

const requireOrder = async (orderId, requestingUser) => {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError(`Order '${orderId}' not found`);
  }
  if (requestingUser.role === ROLES.CUSTOMER && order.userId !== requestingUser.userId) {
    throw new ForbiddenError('You do not have access to this order');
  }
  return order;
};

const buildPaymentPayload = (payment, order = null) => ({
  payment,
  order,
});

const createPendingPayment = async (
  order,
  paymentMethod = PAYMENT_METHOD.DUMMY,
  context = {},
  { currency = order.currency || 'INR' } = {}
) => {
  const gateway = await dummyGateway.initiate();
  const payment = await paymentRepository.create({
    paymentId: genId('PAY'),
    orderId: order.orderId,
    userId: order.userId,
    amount: order.totalAmount ?? order.total ?? 0,
    currency,
    paymentMethod,
    transactionId: gateway.gatewayRef,
    paymentStatus: PAYMENT_STATUS.PENDING,
  });

  await publishPaymentCreated(buildPaymentPayload(payment, order), { ...context, source: 'payment-service' });
  return payment;
};

const settlePaymentSuccess = async (payment, context = {}, transactionId = null) => {
  const updated = await paymentRepository.updateStatus(payment.paymentId, PAYMENT_STATUS.SUCCESS, {
    transactionId: transactionId || payment.transactionId || null,
  });

  await publishPaymentSuccess(buildPaymentPayload(updated), { ...context, source: 'payment-service' });
  return updated;
};

const settlePaymentFailure = async (payment, context = {}) => {
  const updated = await paymentRepository.updateStatus(payment.paymentId, PAYMENT_STATUS.FAILED);
  await publishPaymentFailed(buildPaymentPayload(updated), { ...context, source: 'payment-service' });
  return updated;
};

const createPayment = async (requestingUser, { orderId, paymentMethod, currency }, context = {}) => {
  const order = await requireOrder(orderId, requestingUser);
  if (order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
    throw new BadRequestError('This order has already been paid for');
  }

  const existing = await paymentRepository.findLatestByOrderId(orderId);
  if (existing && [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS].includes(existing.paymentStatus)) {
    assertOwnership(existing, requestingUser);
    return existing;
  }

  try {
    return await createPendingPayment(order, paymentMethod || PAYMENT_METHOD.DUMMY, context, {
      currency: currency || order.currency || 'INR',
    });
  } catch (error) {
    if (isRetryableConflict(error)) {
      const payment = await paymentRepository.findLatestByOrderId(orderId);
      if (payment) return payment;
    }
    throw error;
  }
};

const getPaymentById = async (requestingUser, paymentId) => {
  const payment = await paymentRepository.findById(paymentId);
  if (!payment) {
    throw new NotFoundError(`Payment '${paymentId}' not found`);
  }
  assertOwnership(payment, requestingUser);
  return payment;
};

const confirmPayment = async (requestingUser, paymentId, { transactionId } = {}, context = {}) => {
  const payment = await getPaymentById(requestingUser, paymentId);
  if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw new BadRequestError(`Cannot confirm a payment in status '${payment.paymentStatus}'`);
  }

  const result = await dummyGateway.confirm(payment.transactionId);
  if (!result.success) {
    await settlePaymentFailure(payment, context);
    throw new BadRequestError('Payment confirmation failed at gateway');
  }

  const finalTransactionId = transactionId || result.transactionId || payment.transactionId || null;
  const updated = await settlePaymentSuccess(payment, context, finalTransactionId);
  return updated;
};

const failPayment = async (requestingUser, paymentId, context = {}) => {
  const payment = await getPaymentById(requestingUser, paymentId);
  if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw new BadRequestError(`Cannot fail a payment in status '${payment.paymentStatus}'`);
  }
  return settlePaymentFailure(payment, context);
};

const refundPayment = async (requestingUser, paymentId, context = {}) => {
  const payment = await getPaymentById(requestingUser, paymentId);
  if (requestingUser.role === ROLES.CUSTOMER) {
    throw new ForbiddenError('Only FreshMart staff or FreshMart Admin can issue a refund');
  }
  if (payment.paymentStatus !== PAYMENT_STATUS.SUCCESS) {
    throw new BadRequestError(`Only a 'SUCCESS' payment can be refunded (current: '${payment.paymentStatus}')`);
  }

  const result = await dummyGateway.refund(payment.transactionId);
  if (!result.success) {
    throw new BadRequestError('Refund failed at gateway');
  }

  const updated = await paymentRepository.updateStatus(payment.paymentId, PAYMENT_STATUS.REFUNDED);
  await publishPaymentRefunded(buildPaymentPayload(updated), { ...context, source: 'payment-service' });
  return updated;
};

const getStatusByOrderId = async (requestingUser, orderId) => {
  const payment = await paymentRepository.findLatestByOrderId(orderId);
  if (!payment) {
    throw new NotFoundError(`No payment found for order '${orderId}'`);
  }
  assertOwnership(payment, requestingUser);
  return payment;
};

const handleOrderPlacedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  if (!order?.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderPlaced'. Missing required field: order.orderId");
  }

  logger.info('Observed OrderPlaced event', {
    orderId: order.orderId,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  let payment = await paymentRepository.findLatestByOrderId(order.orderId);
  if (!payment) {
    payment = await createPendingPayment(order, order.paymentMethod || PAYMENT_METHOD.DUMMY, context);
  }

  if (payment.paymentStatus === PAYMENT_STATUS.PENDING) {
    const confirmation = await dummyGateway.confirm(payment.transactionId);
    if (confirmation.success) {
      payment = await settlePaymentSuccess(payment, context, confirmation.transactionId);
    } else {
      payment = await settlePaymentFailure(payment, context);
    }
  }

  return {
    orderId: order.orderId,
    payment,
  };
};

module.exports = {
  createPayment,
  getPaymentById,
  confirmPayment,
  failPayment,
  refundPayment,
  getStatusByOrderId,
  handleOrderPlacedEvent,
};
