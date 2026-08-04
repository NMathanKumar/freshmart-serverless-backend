const Joi = require('joi');
const { ORDER_STATUS } = require('@freshmart/service-shared').constants;

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);
const PAYMENT_STATUS_VALUES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

const placeOrderSchema = Joi.object({
  pickupTime: Joi.date().iso().greater('now').optional().messages({
    'date.greater': 'pickupTime must be in the future',
  }),
  addressId: Joi.string().optional(),
  slotId: Joi.string().optional(),
  paymentMethod: Joi.string().valid('CARD', 'UPI', 'COD').optional(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    name: Joi.string().optional(),
    price: Joi.number().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
    unit: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional().allow('', null),
  })).optional(),
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

const adminOrderIdSchema = Joi.object({
  orderId: Joi.string().trim().min(1).max(100).required(),
});

const adminOrderListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid(...ORDER_STATUS_VALUES).optional(),
  paymentStatus: Joi.string().valid(...PAYMENT_STATUS_VALUES).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'totalAmount', 'orderId').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const adminOrderStatusSchema = Joi.object({
  orderStatus: Joi.string().valid(...ORDER_STATUS_VALUES).required(),
});

module.exports = {
  adminOrderIdSchema,
  adminOrderListSchema,
  adminOrderStatusSchema,
  placeOrderSchema,
  updateStatusSchema,
  idParamSchema,
  listQuerySchema,
};
