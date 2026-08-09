const Joi = require('joi');
const { PAYMENT_METHOD } = require('@freshmart/service-shared').constants;

const ALL_PAYMENT_METHODS = Array.from(new Set([
  ...Object.values(PAYMENT_METHOD),
  'APPLE_PAY',
  'GOOGLE_PAY',
  'COD',
  'NET_BANKING',
  'CREDIT_CARD',
  'DEBIT_CARD',
]));

const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentMethod: Joi.string().valid(...ALL_PAYMENT_METHODS).default(PAYMENT_METHOD.DUMMY),
  currency: Joi.string().max(10).optional(),
});

const confirmPaymentSchema = Joi.object({
  transactionId: Joi.string().max(120).optional(),
});

const failPaymentSchema = Joi.object({
  reason: Joi.string().max(255).optional(),
});

const refundPaymentSchema = Joi.object({
  reason: Joi.string().max(255).optional(),
});

const refundPaymentByBodySchema = Joi.object({
  paymentId: Joi.string().required(),
  reason: Joi.string().max(255).optional(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

const orderIdParamSchema = Joi.object({
  orderId: Joi.string().required(),
});

module.exports = {
  createPaymentSchema,
  confirmPaymentSchema,
  failPaymentSchema,
  refundPaymentSchema,
  refundPaymentByBodySchema,
  idParamSchema,
  orderIdParamSchema,
};
