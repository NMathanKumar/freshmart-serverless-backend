const Joi = require('joi');

const idParamSchema = Joi.object({
  productId: Joi.string().required(),
});

const movementIdParamSchema = Joi.object({
  movementId: Joi.string().required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  warehouseId: Joi.string().optional(),
});

const movementListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  warehouseId: Joi.string().optional(),
  movementType: Joi.string().optional(),
});

const createInventorySchema = Joi.object({
  productId: Joi.string().required(),
  warehouseId: Joi.string().required(),
  currentStock: Joi.number().integer().positive().required(),
  minimumStock: Joi.number().integer().min(0).required(),
  unit: Joi.string().min(1).max(32).required(),
});

const updateInventorySchema = Joi.object({
  warehouseId: Joi.string().required(),
  currentStock: Joi.number().integer().positive().required(),
  minimumStock: Joi.number().integer().min(0).required(),
  unit: Joi.string().min(1).max(32).required(),
});

const adjustmentPayloadSchema = {
  amount: Joi.number().integer().required(),
  reason: Joi.string().optional(),
  warehouseId: Joi.string().required(),
  referenceType: Joi.string().optional(),
  referenceId: Joi.string().optional(),
  remarks: Joi.string().optional().allow(''),
};

const increaseSchema = Joi.object({
  ...adjustmentPayloadSchema,
  amount: Joi.number().integer().min(1).required(),
  unit: Joi.string().min(1).max(32).optional(),
});

const decreaseSchema = Joi.object({
  ...adjustmentPayloadSchema,
  amount: Joi.number().integer().min(1).required(),
});

const adjustmentSchema = Joi.object({
  ...adjustmentPayloadSchema,
  amount: Joi.number().integer().required(),
  movementType: Joi.string().optional(),
});

const approveRejectSchema = Joi.object({
  remarks: Joi.string().optional().allow(''),
});

module.exports = {
  idParamSchema,
  movementIdParamSchema,
  listQuerySchema,
  movementListQuerySchema,
  createInventorySchema,
  updateInventorySchema,
  increaseSchema,
  decreaseSchema,
  adjustmentSchema,
  approveRejectSchema,
};
