const logger = require('../utils/logger');
const { eventPublisher } = require('../index'); // this will be require('@freshmart/service-shared')

// Now these will publish via EventBridge instead of SNS!
const publishLowStock = async (payload = {}) =>
  eventPublisher.publishInventoryLow(payload, { source: 'sns-adapter' });

const publishOrderReady = async (payload = {}) =>
  eventPublisher.publishOrderReady(payload, { source: 'sns-adapter' });

const publishPaymentSuccess = async (payload = {}) =>
  eventPublisher.publishPaymentSuccess(payload, { source: 'sns-adapter' });

const publishPaymentFailure = async (payload = {}) =>
  eventPublisher.publishPaymentFailed(payload, { source: 'sns-adapter' });

const publishNotification = async (payload = {}) =>
  eventPublisher.publishDomainEvent('notification.created', payload, { source: 'sns-adapter' });

const publishOrderPlacedNotification = async (payload = {}) =>
  eventPublisher.publishOrderPlaced(payload, { source: 'sns-adapter' });

const publishReportNotification = async (payload = {}) =>
  eventPublisher.publishDailyReportGenerated(payload, { source: 'sns-adapter' });

module.exports = {
  publishLowStock,
  publishOrderPlacedNotification,
  publishOrderReady,
  publishPaymentSuccess,
  publishPaymentFailure,
  publishNotification,
  publishReportNotification,
};
