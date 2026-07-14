const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher } = require('@freshmart/service-shared');

const logger = sharedLogger.child({ service: 'notification-service' });

const EVENT_TYPES = Object.freeze({
  NOTIFICATION_CREATED: 'NotificationCreated.v1',
  NOTIFICATION_DELIVERED: 'NotificationDelivered.v1',
  NOTIFICATION_FAILED: 'NotificationFailed.v1',
});

const publishNotificationEvent = async (eventType, payload = {}, context = {}) => {
  const start = Date.now();
  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'notification-service',
    });
    const latencyMs = Date.now() - start;

    logger.info('Notification event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
      latencyMs,
    });

    return event;
  } catch (error) {
    const latencyMs = Date.now() - start;
    logger.error('Notification event publish failed', {
      eventType,
      publishStatus: 'FAILED',
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      latencyMs,
      failureReason: error.message,
    });
    throw error;
  }
};

const createPublisher = (eventType) => (payload = {}, context = {}) =>
  publishNotificationEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishNotificationEvent,
  publishNotificationCreated: createPublisher(EVENT_TYPES.NOTIFICATION_CREATED),
  publishNotificationDelivered: createPublisher(EVENT_TYPES.NOTIFICATION_DELIVERED),
  publishNotificationFailed: createPublisher(EVENT_TYPES.NOTIFICATION_FAILED),
};
