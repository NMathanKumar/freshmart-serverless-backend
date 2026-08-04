const Joi = require('joi');

const deliveryIdSchema = Joi.object({
  deliveryId: Joi.string().trim().min(1).max(128).required(),
});

const deliveryListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('ASSIGNED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED').optional(),
  driverId: Joi.string().trim().max(128).allow('', null).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'scheduledAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const deliveryStatusSchema = Joi.object({
  status: Joi.string().valid('PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED').required(),
  note: Joi.string().max(300).allow('', null).optional(),
});

const assignDriverSchema = Joi.object({
  driverId: Joi.string().trim().min(1).max(128).required(),
  driverName: Joi.string().trim().max(120).allow('', null).optional(),
  driverPhone: Joi.string().max(30).allow('', null).optional(),
});

const cancelDeliverySchema = Joi.object({
  reason: Joi.string().max(300).allow('', null).optional(),
});

module.exports = {
  deliveryIdSchema,
  deliveryListSchema,
  deliveryStatusSchema,
  assignDriverSchema,
  cancelDeliverySchema,
};
