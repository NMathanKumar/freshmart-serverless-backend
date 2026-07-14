const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher } = require('@freshmart/service-shared');

const logger = sharedLogger.child({ service: 'admin-service' });

const EVENT_TYPES = Object.freeze({
  ADMIN_CONFIG_UPDATED: 'AdminConfigUpdated.v1',
  ADMIN_DASHBOARD_UPDATED: 'AdminDashboardUpdated.v1',
});

const publishAdminEvent = async (eventType, payload = {}, context = {}) => {
  const start = Date.now();

  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'admin-service',
    });

    logger.info('Admin event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
      latencyMs: Date.now() - start,
    });

    return event;
  } catch (error) {
    logger.error('Admin event publish failed', {
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
  publishAdminEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishAdminEvent,
  publishAdminConfigUpdated: createPublisher(EVENT_TYPES.ADMIN_CONFIG_UPDATED),
  publishAdminDashboardUpdated: createPublisher(EVENT_TYPES.ADMIN_DASHBOARD_UPDATED),
};
