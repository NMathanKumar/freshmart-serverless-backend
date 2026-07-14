const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher } = require('@freshmart/service-shared');

const logger = sharedLogger.child({ service: 'analytics-service' });

const EVENT_TYPES = Object.freeze({
  DAILY_REPORT_GENERATED: 'DailyReportGenerated.v1',
  ANALYTICS_UPDATED: 'AnalyticsUpdated.v1',
});

const publishAnalyticsEvent = async (eventType, payload = {}, context = {}) => {
  const start = Date.now();

  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'analytics-service',
    });

    logger.info('Analytics event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
      latencyMs: Date.now() - start,
    });

    return event;
  } catch (error) {
    logger.error('Analytics event publish failed', {
      eventType,
      publishStatus: 'FAILED',
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      latencyMs: Date.now() - start,
      failureReason: error.message,
    });
    throw error;
  }
};

const createPublisher = (eventType) => (payload = {}, context = {}) =>
  publishAnalyticsEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishAnalyticsEvent,
  publishDailyReportGenerated: createPublisher(EVENT_TYPES.DAILY_REPORT_GENERATED),
  publishAnalyticsUpdated: createPublisher(EVENT_TYPES.ANALYTICS_UPDATED),
};
