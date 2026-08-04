const Joi = require('joi');

const profileSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null).optional(),
  avatarUrl: Joi.string().uri().max(500).allow('', null).optional(),
  preferences: Joi.object().unknown(true).optional(),
});

const addressSchema = Joi.object({
  label: Joi.string().valid('Home', 'Work', 'Other').required(),
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().max(20).required(),
  line1: Joi.string().min(2).max(200).required(),
  line2: Joi.string().max(200).allow('', null).optional(),
  landmark: Joi.string().max(200).allow('', null).optional(),
  city: Joi.string().min(2).max(120).required(),
  state: Joi.string().min(2).max(120).required(),
  postalCode: Joi.string().min(3).max(20).required(),
  isDefault: Joi.boolean().default(false),
});

const adminCustomerIdSchema = Joi.object({
  customerId: Joi.string().trim().min(1).max(128).required(),
});

const adminCustomerListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  // Accept both pageSize (task spec) and limit (legacy) — pageSize takes precedence
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').optional(),
  sortBy: Joi.string()
    .valid('registrationDate', 'updatedAt', 'name', 'email', 'orderCount', 'totalSpending', 'lastOrderDate')
    .default('registrationDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const adminCustomerStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').required(),
});

module.exports = {
  adminCustomerIdSchema,
  adminCustomerListSchema,
  adminCustomerStatusSchema,
  profileSchema,
  addressSchema,
};
