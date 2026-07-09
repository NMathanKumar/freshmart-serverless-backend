const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created } = require('@freshmart/shared').response;
const paymentService = require('../services/payment.service');

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.user, req.body, req.eventContext);
  created(res, { message: 'Payment created successfully', data: payment });
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.user, req.params.id);
  success(res, { message: 'Payment fetched', data: payment });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.confirmPayment(req.user, req.params.id, req.body, req.eventContext);
  success(res, { message: 'Payment confirmed', data: payment });
});

const failPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.failPayment(req.user, req.params.id, req.eventContext);
  success(res, { message: 'Payment failed', data: payment });
});

const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.user, req.params.id, req.eventContext);
  success(res, { message: 'Payment refunded', data: payment });
});

const refundPaymentByBody = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.user, req.body.paymentId, req.eventContext);
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
