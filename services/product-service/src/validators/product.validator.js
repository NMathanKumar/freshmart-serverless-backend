const Joi = require('joi');

const createProductSchema = Joi.object({
  productName: Joi.string().min(2).max(160).required(),
  description: Joi.string().max(1000).allow('', null),
  category: Joi.string().min(2).max(80).required(),
  brand: Joi.string().max(120).allow('', null),
  price: Joi.number().positive().precision(2).required(),
  images: Joi.array().items(Joi.string().uri().max(500)).max(10).default([]),
  available: Joi.boolean().default(true),
  weight: Joi.number().positive().allow(null),
  unit: Joi.string().min(1).max(32).allow('', null),
  stock: Joi.number().integer().min(0).default(0),
});

const updateProductSchema = Joi.object({
  productName: Joi.string().min(2).max(160),
  description: Joi.string().max(1000).allow('', null),
  category: Joi.string().min(2).max(80),
  brand: Joi.string().max(120).allow('', null),
  price: Joi.number().positive().precision(2),
  images: Joi.array().items(Joi.string().uri().max(500)).max(10),
  available: Joi.boolean(),
  weight: Joi.number().positive().allow(null),
  unit: Joi.string().min(1).max(32).allow('', null),
  stock: Joi.number().integer().min(0),
}).min(1);

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

const availabilitySchema = Joi.object({
  available: Joi.boolean().required(),
});

const listQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100),
  cursor: Joi.string(),
  category: Joi.string(),
});

const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).required(),
  limit: Joi.number().integer().min(1).max(100),
  cursor: Joi.string(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  availabilitySchema,
  listQuerySchema,
  searchQuerySchema,
};
