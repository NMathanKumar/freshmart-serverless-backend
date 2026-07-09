const Joi = require('joi');

const idParamSchema = Joi.object({
  productId: Joi.string().required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const createInventorySchema = Joi.object({
  productId: Joi.string().required(),
  currentStock: Joi.number().integer().positive().required(),
  minimumStock: Joi.number().integer().min(0).required(),
  unit: Joi.string().min(1).max(32).required(),
});

const updateInventorySchema = Joi.object({
  currentStock: Joi.number().integer().positive().required(),
  minimumStock: Joi.number().integer().min(0).required(),
  unit: Joi.string().min(1).max(32).required(),
});

const increaseSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
  unit: Joi.string().min(1).max(32).optional(),
});

const decreaseSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
});

module.exports = {
  idParamSchema,
  listQuerySchema,
  createInventorySchema,
  updateInventorySchema,
  increaseSchema,
  decreaseSchema,
};
