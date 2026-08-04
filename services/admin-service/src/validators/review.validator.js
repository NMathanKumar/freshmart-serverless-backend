const Joi = require('joi');

const reviewIdSchema = Joi.object({
  reviewId: Joi.string().trim().min(1).max(128).required(),
});

const reviewListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').optional(),
  status: Joi.string().valid('PENDING', 'APPROVED', 'HIDDEN', 'REJECTED').optional(),
  productId: Joi.string().trim().max(128).allow('', null).optional(),
  customerId: Joi.string().trim().max(128).allow('', null).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  featured: Joi.boolean().optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'rating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const updateReviewSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'HIDDEN', 'REJECTED').optional(),
  featured: Joi.boolean().optional(),
  adminNote: Joi.string().max(500).allow('', null).optional(),
}).min(1);

module.exports = { reviewIdSchema, reviewListSchema, updateReviewSchema };
