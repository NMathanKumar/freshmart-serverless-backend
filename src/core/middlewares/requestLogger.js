const logger = require('../utils/logger');
const { genId } = require('../utils/id');

/**
 * Lightweight structured request logger. In Lambda this output lands in
 * CloudWatch Logs automatically; locally it prints to console/file via
 * winston transports configured in utils/logger.js.
 */
const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || genId('REQ');
  req.requestId = requestId;
  req.eventContext = {
    requestId,
    correlationId: requestId,
  };
  res.locals.requestId = requestId;
  res.locals.eventContext = req.eventContext;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP request', {
      requestId,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.userId || null,
    });
  });
  next();
};

module.exports = requestLogger;
