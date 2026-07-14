const logger = require('@freshmart/service-shared').logger;
const { buildSuccessResponse, buildErrorResponse, logEventContext } = require('./utils');

const processedEvents = new Map();
const COMPLETED_TTL_MS = 24 * 60 * 60 * 1000;

const pruneCompletedEvents = () => {
  const now = Date.now();
  for (const [eventId, record] of processedEvents.entries()) {
    if (record.status === 'completed' && now - record.updatedAt > COMPLETED_TTL_MS) {
      processedEvents.delete(eventId);
    }
  }
};

const withStructuredLogging = async (handler, event, runtimeContext = {}) => {
  const logContext = {
    eventId: runtimeContext.eventId,
    eventType: runtimeContext.eventType,
    correlationId: runtimeContext.correlationId,
    requestId: runtimeContext.requestId,
    consumer: runtimeContext.consumer,
  };

  logEventContext('info', 'Lambda event received', logContext);
  const start = Date.now();
  const response = await handler(event, runtimeContext);
  logger.info('Lambda event processed', {
    ...logContext,
    latencyMs: Date.now() - start,
  });
  return response;
};

const withIdempotency = async (handler, event, runtimeContext = {}) => {
  pruneCompletedEvents();
  const eventId = runtimeContext.eventId;
  if (!eventId) {
    return handler(event, runtimeContext);
  }

  const existing = processedEvents.get(eventId);
  if (existing?.status === 'completed') {
    return buildSuccessResponse({
      eventId,
      eventType: runtimeContext.eventType,
      correlationId: runtimeContext.correlationId,
      requestId: runtimeContext.requestId,
      consumer: runtimeContext.consumer,
      message: 'Duplicate event ignored',
      deduped: true,
      result: existing.result || null,
    });
  }

  if (existing?.status === 'processing') {
    return buildSuccessResponse({
      eventId,
      eventType: runtimeContext.eventType,
      correlationId: runtimeContext.correlationId,
      requestId: runtimeContext.requestId,
      consumer: runtimeContext.consumer,
      message: 'Event is already being processed',
      deduped: true,
    });
  }

  processedEvents.set(eventId, { status: 'processing', updatedAt: Date.now() });
  try {
    const result = await handler(event, runtimeContext);
    processedEvents.set(eventId, {
      status: 'completed',
      updatedAt: Date.now(),
      result,
    });
    return result;
  } catch (error) {
    processedEvents.delete(eventId);
    throw error;
  }
};

const withErrorBoundary = async (handler, event, runtimeContext = {}) => {
  try {
    return await handler(event, runtimeContext);
  } catch (error) {
    logger.error('Lambda event failed', {
      eventId: runtimeContext.eventId || null,
      eventType: runtimeContext.eventType || null,
      correlationId: runtimeContext.correlationId || null,
      requestId: runtimeContext.requestId || null,
      consumer: runtimeContext.consumer || null,
      error: error.message,
    });
    return buildErrorResponse({
      eventId: runtimeContext.eventId,
      eventType: runtimeContext.eventType,
      correlationId: runtimeContext.correlationId,
      requestId: runtimeContext.requestId,
      consumer: runtimeContext.consumer,
      error,
    });
  }
};

const runMiddlewareStack = async (handler, event, runtimeContext = {}) => {
  const pipeline = async (evt, ctx) =>
    withErrorBoundary(
      async (innerEvent, innerContext) =>
        withStructuredLogging(
          (structuredEvent, structuredContext) =>
            withIdempotency(handler, structuredEvent, structuredContext),
          innerEvent,
          innerContext
        ),
      evt,
      ctx
    );

  return pipeline(event, runtimeContext);
};

module.exports = {
  runMiddlewareStack,
  processedEvents,
};
