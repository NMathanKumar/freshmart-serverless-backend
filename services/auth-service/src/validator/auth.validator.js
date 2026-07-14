const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/)
  .required()
  .messages({
    'string.min': 'password must be at least 8 characters',
    'string.pattern.base':
      'password must contain at least one uppercase letter, one number, and one special character',
  });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  phone: Joi.string().max(20).optional().allow(null, ''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const challengeSchema = Joi.object({
  challengeName: Joi.string().required(),
  session: Joi.string().optional().allow(null, ''),
  challengeResponses: Joi.object().unknown(true).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional().allow(null, ''),
  accessToken: Joi.string().optional().allow(null, ''),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const confirmPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  password: passwordSchema,
});

const verificationRequestSchema = Joi.object({});

const verificationConfirmSchema = Joi.object({
  code: Joi.string().required(),
});

const setupMfaSchema = Joi.object({});

const verifyMfaSchema = Joi.object({
  userCode: Joi.string().required(),
  friendlyDeviceName: Joi.string().max(128).optional().allow(null, ''),
});

const setMfaPreferenceSchema = Joi.object({
  preferredMfa: Joi.string().valid('SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'NOMFA').optional().allow(null, ''),
  smsEnabled: Joi.boolean().optional(),
  softwareTokenEnabled: Joi.boolean().optional(),
});

const changePasswordSchema = Joi.object({
  previousPassword: Joi.string().required(),
  proposedPassword: passwordSchema,
});

const adminCreateUserSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  phone: Joi.string().max(20).optional().allow(null, ''),
  role: Joi.string().valid('CUSTOMER', 'STAFF', 'ADMIN').optional(),
  groups: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  challengeSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  confirmPasswordResetSchema,
  verificationRequestSchema,
  verificationConfirmSchema,
  setupMfaSchema,
  verifyMfaSchema,
  setMfaPreferenceSchema,
  changePasswordSchema,
  adminCreateUserSchema,
};
