const Joi = require('joi');

const adminConfigSchema = Joi.object({
  configKey: Joi.string().default('DEFAULT'),
  data: Joi.object().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const auditQuerySchema = Joi.object({
  status: Joi.string().valid('RECORDED', 'ACTIVE', 'INACTIVE').optional(),
  eventType: Joi.string().optional(),
});

module.exports = {
  adminConfigSchema,
  auditQuerySchema,
};
