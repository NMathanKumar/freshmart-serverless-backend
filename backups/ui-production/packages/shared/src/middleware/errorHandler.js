const logger = require('../utils/logger');
const config = require('../config');
const { ApiError } = require('../errors/ApiError');

const buildErrorBody = ({ statusCode, errorCode, message, errors, requestId }) => ({
  success: false,
  error: {
    code: errorCode,
    message,
    requestId,
  },
  message,
  errorCode,
  errors,
  timestamp: new Date().toISOString(),
  requestId,
});

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isKnown = err instanceof ApiError;
  const statusCode = isKnown ? err.statusCode : 500;
  const errorCode = isKnown ? err.errorCode : 'INTERNAL_ERROR';
  const message = isKnown || !config.isProduction ? err.message : 'Something went wrong';
  const requestId = res.locals.requestId || req.requestId || null;

  if (statusCode >= 500) {
    logger.error(err.message, {
      path: req.originalUrl,
      method: req.method,
      errorName: err?.name || null,
      errorCode,
      errorCodeRaw: err?.code || null,
      stack: err?.stack || null,
    });
  } else {
    logger.warn(err.message, { path: req.originalUrl, method: req.method, errorCode });
  }

  res.status(statusCode).json(
    buildErrorBody({
      statusCode,
      errorCode,
      message,
      errors: isKnown ? err.errors : null,
      requestId,
    })
  );
};

const notFoundHandler = (req, res, next) => {
  const requestId = res.locals.requestId || req.requestId || null;
  res.status(404).json(
    buildErrorBody({
      statusCode: 404,
      errorCode: 'ROUTE_NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      errors: null,
      requestId,
    })
  );
};

module.exports = { errorHandler, notFoundHandler };
