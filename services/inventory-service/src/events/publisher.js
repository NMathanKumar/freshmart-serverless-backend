const sharedLogger = require('@freshmart/service-shared').logger;
const { eventPublisher, constants } = require('@freshmart/service-shared');
const { EVENT_TYPES } = constants;

const logger = sharedLogger.child({ service: 'inventory-service' });



const publishInventoryEvent = async (eventType, payload = {}, context = {}) => {
  logger.info('Publishing inventory event', {
    eventType,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
    source: context.source || 'inventory-service',
  });

  try {
    const event = await eventPublisher.publishDomainEvent(eventType, payload, {
      ...context,
      source: context.source || 'inventory-service',
    });

    logger.info('Inventory event published', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'PUBLISHED',
      correlationId: event.correlationId || null,
      requestId: event.requestId || null,
    });

    return event;
  } catch (error) {
    logger.error('Inventory event publish failed', {
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
  publishInventoryEvent(eventType, payload, context);

module.exports = {
  EVENT_TYPES,
  publishInventoryEvent,
  publishInventoryUpdated: createPublisher(EVENT_TYPES.INVENTORY_UPDATED),
  publishInventoryLow: createPublisher(EVENT_TYPES.INVENTORY_LOW),
  publishInventoryOutOfStock: createPublisher(EVENT_TYPES.INVENTORY_OUT_OF_STOCK),
  publishInventoryRestocked: createPublisher(EVENT_TYPES.INVENTORY_RESTOCKED),
};
