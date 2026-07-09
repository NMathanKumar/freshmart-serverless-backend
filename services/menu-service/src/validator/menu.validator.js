const Joi = require('joi');

const createFoodSchema = Joi.object({
	name: Joi.string().min(2).max(160).required(),
	description: Joi.string().max(1000).allow('', null),
	category: Joi.string().min(2).max(80).required(),
	price: Joi.number().positive().precision(2).required(),
	imageUrl: Joi.string().uri().max(500).allow('', null),
	available: Joi.boolean().default(true),
	preparationTime: Joi.number().integer().min(1).max(180).default(10),
});

const updateFoodSchema = Joi.object({
	name: Joi.string().min(2).max(160),
	description: Joi.string().max(1000).allow('', null),
	category: Joi.string().min(2).max(80),
	price: Joi.number().positive().precision(2),
	imageUrl: Joi.string().uri().max(500).allow('', null),
	available: Joi.boolean(),
	preparationTime: Joi.number().integer().min(1).max(180),
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
	createFoodSchema,
	updateFoodSchema,
	idParamSchema,
	availabilitySchema,
	listQuerySchema,
	searchQuerySchema,
};

