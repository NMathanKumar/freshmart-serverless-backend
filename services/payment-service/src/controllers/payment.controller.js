const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created } = require('@freshmart/service-shared').response;
const { emitBusinessMetrics } = require('@freshmart/service-shared').metrics;
const paymentService = require('../services/payment.service');

const createPayment = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const payment = await paymentService.createPayment(req.user, req.body, req.eventContext);
  try {
    emitBusinessMetrics([
      { name: 'PaymentCreated', value: 1, unit: 'Count', extraDimensions: { EventType: 'payment' } },
      { name: 'PaymentProcessingTime', value: Date.now() - startTime, unit: 'Milliseconds', extraDimensions: { EventType: 'payment' } }
    ]);
  } catch (_) {}
  created(res, { message: 'Payment created successfully', data: payment });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.user, req.params.id);
  success(res, { message: 'Payment fetched', data: payment });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const payment = await paymentService.confirmPayment(req.user, req.params.id, req.body, req.eventContext);
  try {
    emitBusinessMetrics([
      { name: 'PaymentSucceeded', value: 1, unit: 'Count', extraDimensions: { EventType: 'payment', PaymentMethod: payment.paymentMethod || 'unknown' } },
      { name: 'PaymentAmount', value: payment.amount || 0, unit: 'None', extraDimensions: { EventType: 'payment', PaymentMethod: payment.paymentMethod || 'unknown', Currency: 'SGD' } },
      { name: 'PaymentProcessingTime', value: Date.now() - startTime, unit: 'Milliseconds', extraDimensions: { EventType: 'payment', PaymentMethod: payment.paymentMethod || 'unknown' } }
    ]);
  } catch (_) {}
  success(res, { message: 'Payment confirmed', data: payment });
});

const failPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.failPayment(req.user, req.params.id, req.eventContext);
  try {
    emitBusinessMetrics([
      { name: 'PaymentFailed', value: 1, unit: 'Count', extraDimensions: { EventType: 'payment' } }
    ]);
  } catch (_) {}
  success(res, { message: 'Payment failed', data: payment });
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.user, req.params.id, req.eventContext);
  try {
    emitBusinessMetrics([
      { name: 'PaymentRefunded', value: 1, unit: 'Count', extraDimensions: { EventType: 'payment' } }
    ]);
  } catch (_) {}
  success(res, { message: 'Payment refunded', data: payment });
});

const refundPaymentByBody = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.user, req.body.paymentId, req.eventContext);
  try {
    emitBusinessMetrics([
      { name: 'PaymentRefunded', value: 1, unit: 'Count', extraDimensions: { EventType: 'payment' } }
    ]);
  } catch (_) {}
  success(res, { message: 'Payment refunded', data: payment });
});

const getStatusByOrderId = asyncHandler(async (req, res) => {
  const payment = await paymentService.getStatusByOrderId(req.user, req.params.orderId);
  success(res, { message: 'Payment status fetched', data: payment });
});

module.exports = {
  createPayment,
  getPaymentById,
  confirmPayment,
  failPayment,
  refundPayment,
  refundPaymentByBody,
  getStatusByOrderId,
};
