const Joi = require('joi');

const couponIdSchema = Joi.object({
  couponId: Joi.string().trim().min(1).max(128).required(),
});

const couponListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'DISABLED').optional(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'expiresAt', 'usageCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(32).required(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT').required(),
  value: Joi.number().positive().required(),
  minimumOrder: Joi.number().min(0).default(0),
  maximumDiscount: Joi.number().positive().allow(null).optional(),
  usageLimit: Joi.number().integer().positive().allow(null).optional(),
  startsAt: Joi.string().isoDate().allow(null).optional(),
  expiresAt: Joi.string().isoDate().allow(null).optional(),
  status: Joi.string().valid('ACTIVE', 'DISABLED').default('ACTIVE'),
  description: Joi.string().max(300).allow('', null).optional(),
});

const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(32).optional(),
  type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
  value: Joi.number().positive().optional(),
  minimumOrder: Joi.number().min(0).optional(),
  maximumDiscount: Joi.number().positive().allow(null).optional(),
  usageLimit: Joi.number().integer().positive().allow(null).optional(),
  startsAt: Joi.string().isoDate().allow(null).optional(),
  expiresAt: Joi.string().isoDate().allow(null).optional(),
  status: Joi.string().valid('ACTIVE', 'DISABLED').optional(),
  description: Joi.string().max(300).allow('', null).optional(),
}).min(1);

const couponStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'DISABLED').required(),
});

module.exports = { couponIdSchema, couponListSchema, createCouponSchema, updateCouponSchema, couponStatusSchema };
