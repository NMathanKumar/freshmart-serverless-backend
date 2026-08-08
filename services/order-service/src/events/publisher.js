const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher, constants } = require('@freshmart/service-shared');
const { EVENT_TYPES } = constants;

const logger = sharedLogger.child({ service: 'order-service' });

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
  publishOrderOutForDelivery: createPublisher(EVENT_TYPES.ORDER_OUT_FOR_DELIVERY),
  publishOrderCompleted: createPublisher(EVENT_TYPES.ORDER_COMPLETED),
};
