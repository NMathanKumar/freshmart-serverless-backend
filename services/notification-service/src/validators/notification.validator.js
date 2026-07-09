const Joi = require('joi');

const createNotificationSchema = Joi.object({
  type: Joi.string().required(),
  userId: Joi.string().required(),
  subject: Joi.string().max(255).optional(),
  message: Joi.string().max(1000).optional(),
  eventType: Joi.string().required(),
  payload: Joi.object().required(),
  recipient: Joi.object({
    userId: Joi.string().required(),
    email: Joi.string().email().allow(null, '').optional(),
    phone: Joi.string().allow(null, '').optional(),
  }).optional(),
});

const markFailedSchema = Joi.object({
  failureReason: Joi.string().max(255).optional(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

const listQuerySchema = Joi.object({
  userId: Joi.string().optional(),
  status: Joi.string().valid('QUEUED', 'DELIVERED', 'FAILED').optional(),
});

module.exports = {
  createNotificationSchema,
  markFailedSchema,
  idParamSchema,
  listQuerySchema,
};
