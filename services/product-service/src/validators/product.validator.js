const Joi = require('joi');

const createProductSchema = Joi.object({
  productName: Joi.string().min(1).max(200).allow('', null),
  name: Joi.string().min(1).max(200).allow('', null),
  description: Joi.string().max(2000).allow('', null),
  category: Joi.string().min(1).max(100).allow('', null),
  brand: Joi.string().max(120).allow('', null),
  sku: Joi.string().max(100).allow('', null),
  price: Joi.number().min(0).allow(null),
  images: Joi.array().items(Joi.string().max(5000)).max(20).default([]),
  available: Joi.boolean().default(true),
  weight: Joi.number().positive().allow(null),
  unit: Joi.string().min(1).max(32).allow('', null),
  stock: Joi.number().integer().min(0).default(0),
}).unknown(true);

const updateProductSchema = Joi.object({
  productName: Joi.string().min(1).max(200).allow('', null),
  name: Joi.string().min(1).max(200).allow('', null),
  description: Joi.string().max(2000).allow('', null),
  category: Joi.string().min(1).max(100).allow('', null),
  brand: Joi.string().max(120).allow('', null),
  sku: Joi.string().max(100).allow('', null),
  price: Joi.number().min(0).allow(null),
  images: Joi.array().items(Joi.string().max(5000)).max(20),
  available: Joi.boolean(),
  weight: Joi.number().positive().allow(null),
  unit: Joi.string().min(1).max(32).allow('', null),
  stock: Joi.number().integer().min(0),
}).min(1).unknown(true);

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
