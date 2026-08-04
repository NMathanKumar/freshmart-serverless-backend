const Joi = require('joi');

const categoryIdSchema = Joi.object({
  categoryId: Joi.string().trim().min(1).max(128).required(),
});

const categoryListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DELETED').optional(),
  parentId: Joi.string().trim().max(128).allow('', null).optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'productCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  slug: Joi.string().trim().min(1).max(120).optional(),
  description: Joi.string().max(500).allow('', null).optional(),
  imageUrl: Joi.string().uri().max(500).allow('', null).optional(),
  parentId: Joi.string().trim().max(128).allow('', null).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).optional(),
  slug: Joi.string().trim().min(1).max(120).optional(),
  description: Joi.string().max(500).allow('', null).optional(),
  imageUrl: Joi.string().uri().max(500).allow('', null).optional(),
  parentId: Joi.string().trim().max(128).allow('', null).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
}).min(1);

module.exports = { categoryIdSchema, categoryListSchema, createCategorySchema, updateCategorySchema };
