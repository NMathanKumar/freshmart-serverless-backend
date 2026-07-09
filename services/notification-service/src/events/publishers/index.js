const sharedLogger = require('@freshmart/shared').logger;
const { eventPublisher } = require('@freshmart/shared');

const logger = sharedLogger.child({ service: 'notification-service' });

const EVENT_TYPES = Object.freeze({
  IMAGE_PROCESSED: 'ImageProcessed',
  INVOICE_UPLOADED: 'InvoiceUploaded',
  DAILY_REPORT_GENERATED: 'DailyReportGenerated',
  RESTOCK_JOB_QUEUED: 'RestockJobQueued',
});

const publishImageProcessed = (payload = {}, context = {}) =>
  eventPublisher.publishDomainEvent(EVENT_TYPES.IMAGE_PROCESSED, payload, context);
const publishInvoiceUploaded = (payload = {}, context = {}) =>
  eventPublisher.publishDomainEvent(EVENT_TYPES.INVOICE_UPLOADED, payload, context);
const publishDailyReportGenerated = (payload = {}, context = {}) =>
  eventPublisher.publishDomainEvent(EVENT_TYPES.DAILY_REPORT_GENERATED, payload, context);
const publishRestockJobQueued = (payload = {}, context = {}) =>
  eventPublisher.publishDomainEvent(EVENT_TYPES.RESTOCK_JOB_QUEUED, payload, context);

module.exports = {
  EVENT_TYPES,
  publishImageProcessed,
  publishInvoiceUploaded,
  publishDailyReportGenerated,
  publishRestockJobQueued,
};
