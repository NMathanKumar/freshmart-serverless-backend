const Joi = require('joi');
const { ORDER_STATUS } = require('@freshmart/service-shared').constants;

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

const placeOrderSchema = Joi.object({
  pickupTime: Joi.date().iso().greater('now').optional().messages({
    'date.greater': 'pickupTime must be in the future',
  }),
});

const updateStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid(...ORDER_STATUS_VALUES)
    .required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  orderStatus: Joi.string().valid(...ORDER_STATUS_VALUES),
});

module.exports = {
  placeOrderSchema,
  updateStatusSchema,
  idParamSchema,
  listQuerySchema,
};
