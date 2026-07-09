const logger = require('../utils/logger');
const { genId } = require('../utils/id');

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
    logger.info('HTTP request', {
      requestId,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.userId || null,
    });
  });
  next();
};

module.exports = requestLogger;
