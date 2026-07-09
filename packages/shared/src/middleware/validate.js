const logger = require('../utils/logger');
const { ValidationError } = require('../errors/ApiError');

const isRegisterRequest = (req) => req?.method === 'POST' && /\/v1\/auth\/register$|\/auth\/register$/.test(req?.originalUrl || '');

const validate = (schema, source = 'body') => (req, res, next) => {
  const registerTrace = isRegisterRequest(req);
  if (registerTrace) {
    logger.debug('STEP 1 - validation start', {
      path: req.originalUrl,
      method: req.method,
      source,
    });
  }

  try {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      const validationError = new ValidationError(errors);
      if (registerTrace) {
        logger.error('STEP 1 - validation failed', {
          path: req.originalUrl,
          method: req.method,
          errorName: validationError?.name || null,
          errorMessage: validationError?.message || null,
          errorCode: validationError?.errorCode || null,
          stack: validationError?.stack || null,
        });
      }
      throw validationError;
    }

    req[source] = value;
    if (registerTrace) {
      logger.debug('STEP 1 - validation success', {
        path: req.originalUrl,
        method: req.method,
        fields: Object.keys(value || {}),
      });
    }
    next();
  } catch (error) {
    if (registerTrace && error?.name !== 'ValidationError') {
      logger.error('STEP 1 - validation exception', {
        path: req.originalUrl,
        method: req.method,
        errorName: error?.name || null,
        errorMessage: error?.message || null,
        errorCode: error?.code || null,
        stack: error?.stack || null,
      });
    }
    throw error;
  }
};

module.exports = validate;
