const logger = require('../utils/logger');
const config = require('../config');
const { ApiError } = require('../errors/ApiError');

/**
 * Single place where every error in the app is normalized into the
 * standard error envelope:
 * { success: false, message, errorCode, errors }
 *
 * Operational errors (ApiError subclasses) are trusted and their message
 * is shown to the client. Anything else (programming bugs, driver errors,
 * etc.) is logged with full detail but the client only sees a generic
 * message in production, to avoid leaking internals.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isKnown = err instanceof ApiError;

  const statusCode = isKnown ? err.statusCode : 500;
  const errorCode = isKnown ? err.errorCode : 'INTERNAL_ERROR';
  const message = isKnown || !config.isProduction ? err.message : 'Something went wrong';

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });
  } else {
    logger.warn(err.message, { path: req.originalUrl, method: req.method, errorCode });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors: isKnown ? err.errors : null,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || null,
  });
};

/**
 * Catches requests to routes that don't exist. Registered just before
 * errorHandler.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: 'ROUTE_NOT_FOUND',
    errors: null,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || null,
  });
};

module.exports = { errorHandler, notFoundHandler };
