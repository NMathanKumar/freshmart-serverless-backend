const sharedLogger = require('@freshmart/shared').logger;
const { eventPublisher } = require('@freshmart/shared');

const logger = sharedLogger.child({ service: 'order-service' });

const EVENT_TYPES = Object.freeze({
  ORDER_PLACED: 'OrderPlaced.v1',
  ORDER_CANCELLED: 'OrderCancelled.v1',
  ORDER_ACCEPTED: 'OrderAccepted.v1',
  ORDER_READY: 'OrderReady.v1',
  ORDER_COMPLETED: 'OrderCompleted.v1',
});

const publishOrderEvent = async (eventType, payload = {}, context = {}) => {
  logger.info('Publishing order event', {
    eventType,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
    source: context.source || 'order-service',
  });

  const event = await eventPublisher.publishDomainEvent(eventType, payload, {
    ...context,
    source: context.source || 'order-service',
  });

  logger.info('Order event published', {
    eventId: event.eventId,
    eventType: event.eventType,
    publishStatus: 'PUBLISHED',
    correlationId: event.correlationId || null,
    requestId: event.requestId || null,
  });

  return event;
};

const createPublisher = (eventType) => (payload = {}, context = {}) =>
  publishOrderEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishOrderEvent,
  publishOrderPlaced: createPublisher(EVENT_TYPES.ORDER_PLACED),
  publishOrderCancelled: createPublisher(EVENT_TYPES.ORDER_CANCELLED),
  publishOrderAccepted: createPublisher(EVENT_TYPES.ORDER_ACCEPTED),
  publishOrderReady: createPublisher(EVENT_TYPES.ORDER_READY),
  publishOrderCompleted: createPublisher(EVENT_TYPES.ORDER_COMPLETED),
};
