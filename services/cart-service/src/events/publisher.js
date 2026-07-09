const sharedLogger = require('@freshmart/shared').logger;
const { eventPublisher } = require('@freshmart/shared');

const logger = sharedLogger.child({ service: 'cart-service' });

const EVENT_TYPES = Object.freeze({
  CART_ITEM_ADDED: 'CartItemAdded.v1',
  CART_ITEM_UPDATED: 'CartItemUpdated.v1',
  CART_ITEM_REMOVED: 'CartItemRemoved.v1',
  CART_CLEARED: 'CartCleared.v1',
});

const publishCartEvent = async (eventType, payload = {}, context = {}) => {
  logger.info('Publishing cart event', {
    eventType,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
    source: context.source || 'cart-service',
  });

  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'cart-service',
    });

    logger.info('Cart event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
    });

    return event;
  } catch (error) {
    logger.error('Cart event publish failed', {
      eventType,
      publishStatus: 'FAILED',
      correlationId: context.correlationId || null,
      requestId: context.requestId || null,
      failureReason: error.message,
    });
    throw error;
  }
};

const createPublisher = (eventType) => (payload = {}, context = {}) =>
  publishCartEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishCartEvent,
  publishCartItemAdded: createPublisher(EVENT_TYPES.CART_ITEM_ADDED),
  publishCartItemUpdated: createPublisher(EVENT_TYPES.CART_ITEM_UPDATED),
  publishCartItemRemoved: createPublisher(EVENT_TYPES.CART_ITEM_REMOVED),
  publishCartCleared: createPublisher(EVENT_TYPES.CART_CLEARED),
};
