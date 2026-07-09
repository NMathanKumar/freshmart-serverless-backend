const Joi = require('joi');
const { PAYMENT_METHOD } = require('@freshmart/shared').constants;

const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

const createPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  paymentMethod: Joi.string().valid(...PAYMENT_METHOD_VALUES).default(PAYMENT_METHOD.DUMMY),
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
