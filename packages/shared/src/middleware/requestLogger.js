const logger = require('../utils/logger');
const { genId } = require('../utils/id');

const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || genId('REQ');
  const correlationId = req.headers['x-correlation-id'] || req.headers['x-amzn-trace-id'] || requestId;
  const operation = `${req.method} ${req.originalUrl}`;
  req.requestId = requestId;
  req.correlationId = correlationId;
  req.eventContext = {
    requestId,
    correlationId,
  };
  res.locals.requestId = requestId;
  res.locals.correlationId = correlationId;
  res.locals.eventContext = req.eventContext;
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Correlation-Id', correlationId);

  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request', {
      requestId,
      correlationId,
      method: req.method,
      operation,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.userId || null,
      coldStart: logger.isColdStart(),
      ...logger.captureMemory(),
    });
    logger.markWarm();
  });
  next();
};

module.exports = requestLogger;
