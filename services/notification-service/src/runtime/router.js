const { BadRequestError } = require('@freshmart/service-shared').errors;
const { EVENT_TYPES } = require('../events/constants');
const { buildSuccessResponse, assertRequiredPaths } = require('./utils');
const workflowService = require('../workflows/enterprise-workflow.service');
const notificationService = require('../services/notification.service');

const createConsumer = ({ consumerName, requiredPaths = [], formatter = null, action = null }) => {
  const consumer = async (event, runtimeContext) => {
    const payload = event.payload || {};
    for (const path of requiredPaths) {
      assertRequiredPaths(payload, [path], runtimeContext.eventType);
    }

    const actionResult = action ? await action(payload, runtimeContext) : null;
    const result = formatter ? formatter(payload, actionResult, runtimeContext) : actionResult;

    return buildSuccessResponse({
      eventId: runtimeContext.eventId,
      eventType: runtimeContext.eventType,
      correlationId: runtimeContext.correlationId,
      requestId: runtimeContext.requestId,
      consumer: consumerName,
      message: `${runtimeContext.eventType} handled successfully`,
      result,
    });
  };
  consumer.consumerName = consumerName;
  return consumer;
};

const noopFormatter = (payload) => payload;

// Consumer handlers keyed by EventBridge detail-type (dot-notation).
// Since publishers send a single detail-type per event, we register one handler per type.
// V1 handlers (with real business actions) take precedence over legacy formatters.
const consumers = {
  // Infrastructure events
  [EVENT_TYPES.S3_OBJECT_CREATED]: createConsumer({
    consumerName: 's3ObjectCreatedConsumer',
    requiredPaths: ['foodId', 'bucket', 'key', 'contentType'],
    action: workflowService.processFoodImageObjectCreated,
  }),

  // Customer events
  [EVENT_TYPES.USER_REGISTERED]: createConsumer({
    consumerName: 'userRegisteredConsumer',
    requiredPaths: ['user.userId', 'user.email'],
    action: notificationService.handleUserRegisteredEvent,
  }),

  // Product events (publishers send product.* with { product: { productId, name } })
  [EVENT_TYPES.FOOD_CREATED]: createConsumer({
    consumerName: 'productCreatedConsumer',
    requiredPaths: ['product.productId'],
    formatter: (payload) => ({ productId: payload.product.productId, name: payload.product.name }),
  }),
  [EVENT_TYPES.FOOD_UPDATED]: createConsumer({
    consumerName: 'productUpdatedConsumer',
    requiredPaths: ['product.productId'],
    formatter: (payload) => ({ productId: payload.product.productId }),
  }),
  [EVENT_TYPES.FOOD_AVAILABILITY_CHANGED]: createConsumer({
    consumerName: 'productAvailabilityChangedConsumer',
    requiredPaths: ['product.productId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.FOOD_DELETED]: createConsumer({
    consumerName: 'productDeletedConsumer',
    requiredPaths: ['product.productId'],
    formatter: noopFormatter,
  }),

  // Inventory events (publishers send { inventory: { inventoryId, productId } })
  [EVENT_TYPES.INVENTORY_UPDATED]: createConsumer({
    consumerName: 'inventoryUpdatedConsumer',
    requiredPaths: ['inventory.inventoryId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.INVENTORY_LOW]: createConsumer({
    consumerName: 'inventoryLowConsumer',
    requiredPaths: ['inventory.inventoryId'],
    action: notificationService.handleInventoryLowEvent,
  }),
  [EVENT_TYPES.INVENTORY_OUT_OF_STOCK]: createConsumer({
    consumerName: 'inventoryOutOfStockConsumer',
    requiredPaths: ['inventory.inventoryId'],
    action: notificationService.handleInventoryOutOfStockEvent,
  }),

  // Order events
  [EVENT_TYPES.ORDER_PLACED]: createConsumer({
    consumerName: 'orderPlacedConsumer',
    requiredPaths: ['order.orderId'],
    action: workflowService.processOrderPlaced,
  }),
  [EVENT_TYPES.ORDER_ACCEPTED]: createConsumer({
    consumerName: 'orderAcceptedConsumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderAcceptedEvent,
  }),
  [EVENT_TYPES.ORDER_CANCELLED]: createConsumer({
    consumerName: 'orderCancelledConsumer',
    requiredPaths: ['order.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ORDER_READY]: createConsumer({
    consumerName: 'orderReadyConsumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderReadyEvent,
  }),
  [EVENT_TYPES.ORDER_COMPLETED]: createConsumer({
    consumerName: 'orderCompletedConsumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderCompletedEvent,
  }),

  // Payment events
  [EVENT_TYPES.PAYMENT_CREATED]: createConsumer({
    consumerName: 'paymentCreatedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.PAYMENT_SUCCESS]: createConsumer({
    consumerName: 'paymentSuccessConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: notificationService.handlePaymentSuccessEvent,
  }),
  [EVENT_TYPES.PAYMENT_FAILED]: createConsumer({
    consumerName: 'paymentFailedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.PAYMENT_REFUNDED]: createConsumer({
    consumerName: 'paymentRefundedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),

  // Notification events
  [EVENT_TYPES.NOTIFICATION_CREATED_V1]: createConsumer({
    consumerName: 'notificationCreatedConsumer',
    requiredPaths: ['notification.notificationId'],
    formatter: (payload) => ({ notificationId: payload.notification.notificationId }),
  }),
  [EVENT_TYPES.NOTIFICATION_DELIVERED_V1]: createConsumer({
    consumerName: 'notificationDeliveredConsumer',
    requiredPaths: ['notification.notificationId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.NOTIFICATION_FAILED_V1]: createConsumer({
    consumerName: 'notificationFailedConsumer',
    requiredPaths: ['notification.notificationId'],
    formatter: (payload) => ({ notificationId: payload.notification.notificationId }),
  }),

  // Scheduled/batch events
  [EVENT_TYPES.DAILY_ANALYTICS_SCHEDULED]: createConsumer({
    consumerName: 'dailyAnalyticsScheduledConsumer',
    requiredPaths: ['reportDate'],
    action: workflowService.processDailyAnalyticsScheduled,
  }),
  [EVENT_TYPES.IMAGE_PROCESSED]: createConsumer({
    consumerName: 'imageProcessedConsumer',
    requiredPaths: ['foodId', 'imageUrl'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.INVOICE_UPLOADED]: createConsumer({
    consumerName: 'invoiceUploadedConsumer',
    requiredPaths: ['payment.paymentId', 'invoice.key'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.DAILY_REPORT_GENERATED]: createConsumer({
    consumerName: 'dailyReportGeneratedConsumer',
    requiredPaths: ['reportDate', 'report.reportId'],
    formatter: noopFormatter,
  }),

  // Analytics events
  [EVENT_TYPES.ANALYTICS_UPDATED_V1]: createConsumer({
    consumerName: 'analyticsUpdatedConsumer',
    requiredPaths: ['report.reportId', 'report.reportType'],
    formatter: noopFormatter,
  }),

  // Admin events
  [EVENT_TYPES.ADMIN_CONFIG_UPDATED_V1]: createConsumer({
    consumerName: 'adminConfigUpdatedConsumer',
    requiredPaths: ['config.adminItemId', 'config.entityType'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ADMIN_DASHBOARD_UPDATED_V1]: createConsumer({
    consumerName: 'adminDashboardUpdatedConsumer',
    requiredPaths: ['dashboard.adminItemId', 'dashboard.entityType'],
    formatter: noopFormatter,
  }),

  // Inventory restocking
  [EVENT_TYPES.RESTOCK_JOB_QUEUED]: createConsumer({
    consumerName: 'restockJobQueuedConsumer',
    requiredPaths: ['foodId'],
    formatter: noopFormatter,
  }),
};

const getHandler = (detailType) => {
  const handler = consumers[detailType];
  if (!handler) {
    throw new BadRequestError(`Unsupported EventBridge detail-type: ${detailType}`);
  }
  return handler;
};

module.exports = {
  getHandler,
  consumers,
};
