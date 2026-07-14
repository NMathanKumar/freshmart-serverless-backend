const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher } = require('@freshmart/service-shared');

const logger = sharedLogger.child({ service: 'payment-service' });

const EVENT_TYPES = Object.freeze({
  PAYMENT_CREATED: 'PaymentCreated.v1',
  PAYMENT_SUCCESS: 'PaymentSuccess.v1',
  PAYMENT_FAILED: 'PaymentFailed.v1',
  PAYMENT_REFUNDED: 'PaymentRefunded.v1',
});

const publishPaymentEvent = async (eventType, payload = {}, context = {}) => {
  const start = Date.now();
  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'payment-service',
    });
    const latencyMs = Date.now() - start;

    logger.info('Payment event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
      timestamp: event.timestamp || null,
      latencyMs,
    });

    return event;
  } catch (error) {
    const latencyMs = Date.now() - start;
    logger.error('Payment event publish failed', {
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
  publishPaymentEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishPaymentEvent,
  publishPaymentCreated: createPublisher(EVENT_TYPES.PAYMENT_CREATED),
  publishPaymentSuccess: createPublisher(EVENT_TYPES.PAYMENT_SUCCESS),
  publishPaymentFailed: createPublisher(EVENT_TYPES.PAYMENT_FAILED),
  publishPaymentRefunded: createPublisher(EVENT_TYPES.PAYMENT_REFUNDED),
};
