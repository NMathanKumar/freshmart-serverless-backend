const { BadRequestError } = require('@freshmart/service-shared').errors;
const logger = require('@freshmart/service-shared').logger;

const safeJsonParse = (value) => {
  if (value === undefined || value === null || value === '') return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new BadRequestError('Invalid EventBridge detail payload');
  }
};

const normalizeEventBridgeEvent = (event = {}) => {
  const detail = safeJsonParse(event.detail);
  const detailType = event['detail-type'] || event.detailType || event.eventType || null;

  return {
    id: event.id || event.eventId || null,
    detailType,
    source: event.source || null,
    time: event.time || event.timestamp || new Date().toISOString(),
    detail,
    payload: detail.payload || {},
    rawEvent: event,
  };
};

const getEventMetadata = (event = {}, normalizedEvent = {}) => ({
  eventId: event.id || event.eventId || null,
  eventType: normalizedEvent.detailType || event['detail-type'] || null,
  correlationId: normalizedEvent.detail?.correlationId || null,
  requestId: normalizedEvent.detail?.requestId || null,
  timestamp: normalizedEvent.detail?.timestamp || normalizedEvent.time || null,
});

const buildSuccessResponse = ({
  eventId,
  eventType,
  correlationId,
  requestId,
  consumer,
  message,
  deduped = false,
  result = null,
}) => ({
  statusCode: 200,
  body: JSON.stringify({
    success: true,
    message,
    eventId,
    eventType,
    correlationId,
    requestId,
    consumer,
    deduped,
    result,
  }),
});

const buildErrorResponse = ({
  eventId,
  eventType,
  correlationId,
  requestId,
  consumer,
  error,
}) => ({
  statusCode: error.statusCode || 500,
  body: JSON.stringify({
    success: false,
    message: error.message,
    errorCode: error.errorCode || 'INTERNAL_ERROR',
    eventId,
    eventType,
    correlationId,
    requestId,
    consumer,
  }),
});

const assertRequiredPaths = (value, paths, eventType) => {
  const missing = [];
  for (const path of paths) {
    const segments = path.split('.');
    let current = value;
    for (const segment of segments) {
      if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
        current = current[segment];
      } else {
        current = undefined;
        break;
      }
    }
    if (current === undefined || current === null || current === '') {
      missing.push(path);
    }
  }

  if (missing.length) {
    throw new BadRequestError(
      `Invalid payload for '${eventType}'. Missing required field(s): ${missing.join(', ')}`
    );
  }
};

const logEventContext = (level, message, context = {}) => {
  logger[level](message, {
    eventId: context.eventId || null,
    eventType: context.eventType || null,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
    consumer: context.consumer || null,
  });
};

module.exports = {
  safeJsonParse,
  normalizeEventBridgeEvent,
  getEventMetadata,
  buildSuccessResponse,
  buildErrorResponse,
  assertRequiredPaths,
  logEventContext,
};
