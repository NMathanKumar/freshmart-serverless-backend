const logger = require('../utils/logger');
const { EVENT_TYPES } = require('./constants');
const { hasEventBridgeConfig, publishEvent, buildEventEnvelope } = require('./eventbridge.service');

const publishDomainEvent = async (eventType, payload = {}, context = {}) => {
  const event = buildEventEnvelope(eventType, payload, context);
  await publishEvent(event);
  logger.info('Domain event published', {
    eventId: event.eventId,
    eventType: event.eventType,
    publishStatus: 'PUBLISHED',
  });
  return event;
};

const createPublisher = (eventType) => (payload = {}, context = {}) =>
  publishDomainEvent(eventType, payload, context);

module.exports = {
  hasEventBridgeConfig,
  publishDomainEvent,
  publishProductCreated: createPublisher(EVENT_TYPES.PRODUCT_CREATED),
  publishProductUpdated: createPublisher(EVENT_TYPES.PRODUCT_UPDATED),
  publishProductDeleted: createPublisher(EVENT_TYPES.PRODUCT_DELETED),
  publishProductAvailabilityChanged: createPublisher(EVENT_TYPES.PRODUCT_AVAILABILITY_CHANGED),
  publishInventoryUpdated: createPublisher(EVENT_TYPES.INVENTORY_UPDATED),
  publishInventoryLow: createPublisher(EVENT_TYPES.INVENTORY_LOW),
  publishInventoryOutOfStock: createPublisher(EVENT_TYPES.INVENTORY_OUT_OF_STOCK),
  publishOrderPlaced: createPublisher(EVENT_TYPES.ORDER_PLACED),
  publishOrderCancelled: createPublisher(EVENT_TYPES.ORDER_CANCELLED),
  publishOrderAccepted: createPublisher(EVENT_TYPES.ORDER_ACCEPTED),
  publishPaymentCreated: createPublisher(EVENT_TYPES.PAYMENT_CREATED),
  publishPaymentSuccess: createPublisher(EVENT_TYPES.PAYMENT_SUCCESS),
  publishPaymentFailed: createPublisher(EVENT_TYPES.PAYMENT_FAILED),
  publishPaymentRefunded: createPublisher(EVENT_TYPES.PAYMENT_REFUNDED),
  publishUserRegistered: createPublisher(EVENT_TYPES.USER_REGISTERED),
  publishS3ObjectCreated: createPublisher(EVENT_TYPES.S3_OBJECT_CREATED),
  publishImageProcessed: createPublisher(EVENT_TYPES.IMAGE_PROCESSED),
  publishInvoiceUploaded: createPublisher(EVENT_TYPES.INVOICE_UPLOADED),
  publishDailyAnalyticsScheduled: createPublisher(EVENT_TYPES.DAILY_ANALYTICS_SCHEDULED),
  publishDailyReportGenerated: createPublisher(EVENT_TYPES.DAILY_REPORT_GENERATED),
  publishRestockJobQueued: createPublisher(EVENT_TYPES.RESTOCK_JOB_QUEUED),
};
