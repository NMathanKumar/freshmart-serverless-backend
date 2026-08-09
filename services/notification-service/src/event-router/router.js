const registry = require('./registry');
const { createTelemetryLogger } = require('../logger/logger');

/**
 * Event Router
 * Routes incoming EventBridge events based on detailType envelope contract
 */
const routeEvent = async (event = {}, context = {}) => {
  const detailType = event['detail-type'] || event.detailType || event.eventType;
  const detail = event.detail || event.payload || event;
  const eventId = event.id || event.eventId || `evt_${Date.now()}`;

  const runtimeContext = {
    eventId,
    eventVersion: event.eventVersion || '1.0',
    detailType,
    source: event.source || 'freshmart-platform',
    correlationId: event.correlationId || detail.correlationId || context.awsRequestId || null,
    requestId: event.requestId || detail.requestId || context.awsRequestId || null,
    awsContext: context,
  };

  const logger = createTelemetryLogger(runtimeContext);

  logger.info(`Event received: '${detailType}'`, {
    eventId,
    source: runtimeContext.source,
  });

  const handler = registry.getHandler(detailType);

  if (!handler) {
    logger.warn(`No notification handler registered for detailType '${detailType}'. Skipping email dispatch.`);
    return {
      status: 'IGNORED_UNHANDLED_EVENT',
      detailType,
      eventId,
    };
  }

  const startTime = Date.now();
  try {
    const result = await handler(detail, runtimeContext);
    const processingTimeMs = Date.now() - startTime;

    logger.info(`Event '${detailType}' processed successfully in ${processingTimeMs}ms`, {
      processingTimeMs,
      result,
    });

    logger.metric('EventsProcessed', 1, 'Count', { DetailType: detailType });
    logger.metric('EventProcessingLatency', processingTimeMs, 'Milliseconds', { DetailType: detailType });

    return {
      status: 'SUCCESS',
      detailType,
      eventId,
      processingTimeMs,
      result,
    };
  } catch (error) {
    const processingTimeMs = Date.now() - startTime;
    logger.error(`Error processing event '${detailType}': ${error.message}`, {
      processingTimeMs,
      error: error.stack,
    });

    logger.metric('EventProcessingErrors', 1, 'Count', { DetailType: detailType });
    throw error;
  }
};

module.exports = {
  routeEvent,
};
