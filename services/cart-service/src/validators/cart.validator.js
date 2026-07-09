const Joi = require('joi');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(50).default(1),
  // Product snapshot — caller provides these from the product API response.
  // Cart-service does not call the product table directly.
  price: Joi.number().positive().precision(2).required(),
  productName: Joi.string().min(1).max(160).required(),
  imageUrl: Joi.string().uri().max(500).allow('', null).optional(),
  available: Joi.boolean().default(true),
});

const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(50).required(),
});

const productIdParamSchema = Joi.object({
  productId: Joi.string().required(),
});

module.exports = { addItemSchema, updateQuantitySchema, productIdParamSchema };
