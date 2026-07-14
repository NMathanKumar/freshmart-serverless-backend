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

const consumers = {
  [EVENT_TYPES.S3_OBJECT_CREATED]: createConsumer({
    consumerName: 's3ObjectCreatedConsumer',
    requiredPaths: ['foodId', 'bucket', 'key', 'contentType'],
    action: workflowService.processFoodImageObjectCreated,
  }),
  [EVENT_TYPES.USER_REGISTERED]: createConsumer({
    consumerName: 'userRegisteredConsumer',
    requiredPaths: ['user.userId', 'user.email'],
    formatter: (payload) => ({ userId: payload.user.userId, email: payload.user.email }),
  }),
  [EVENT_TYPES.USER_REGISTERED_V1]: createConsumer({
    consumerName: 'userRegisteredV1Consumer',
    requiredPaths: ['user.userId', 'user.email'],
    action: notificationService.handleUserRegisteredEvent,
  }),
  [EVENT_TYPES.FOOD_CREATED]: createConsumer({
    consumerName: 'foodCreatedConsumer',
    requiredPaths: ['food.foodId', 'food.name'],
    formatter: (payload) => ({ foodId: payload.food.foodId, name: payload.food.name }),
  }),
  [EVENT_TYPES.FOOD_UPDATED]: createConsumer({
    consumerName: 'foodUpdatedConsumer',
    requiredPaths: ['food.foodId'],
    formatter: (payload) => ({ foodId: payload.food.foodId }),
  }),
  [EVENT_TYPES.FOOD_AVAILABILITY_CHANGED]: createConsumer({
    consumerName: 'foodAvailabilityChangedConsumer',
    requiredPaths: ['food.foodId', 'food.available'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.FOOD_DELETED]: createConsumer({
    consumerName: 'foodDeletedConsumer',
    requiredPaths: ['foodId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.INVENTORY_UPDATED]: createConsumer({
    consumerName: 'inventoryUpdatedConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.INVENTORY_LOW]: createConsumer({
    consumerName: 'inventoryLowConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    formatter: (payload) => ({ inventoryId: payload.inventory.inventoryId, foodId: payload.inventory.foodId }),
  }),
  [EVENT_TYPES.INVENTORY_LOW_V1]: createConsumer({
    consumerName: 'inventoryLowV1Consumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: notificationService.handleInventoryLowEvent,
  }),
  [EVENT_TYPES.INVENTORY_OUT_OF_STOCK]: createConsumer({
    consumerName: 'inventoryOutOfStockConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.INVENTORY_OUT_OF_STOCK_V1]: createConsumer({
    consumerName: 'inventoryOutOfStockV1Consumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: notificationService.handleInventoryOutOfStockEvent,
  }),
  [EVENT_TYPES.ORDER_PLACED]: createConsumer({
    consumerName: 'orderPlacedConsumer',
    requiredPaths: ['order.orderId'],
    action: workflowService.processOrderPlaced,
  }),
  [EVENT_TYPES.ORDER_PLACED_V1]: createConsumer({
    consumerName: 'orderPlacedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: workflowService.processOrderPlaced,
  }),
  [EVENT_TYPES.ORDER_ACCEPTED]: createConsumer({
    consumerName: 'orderAcceptedConsumer',
    requiredPaths: ['order.orderId'],
    formatter: (payload) => ({ orderId: payload.order.orderId }),
  }),
  [EVENT_TYPES.ORDER_ACCEPTED_V1]: createConsumer({
    consumerName: 'orderAcceptedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderAcceptedEvent,
  }),
  [EVENT_TYPES.ORDER_CANCELLED]: createConsumer({
    consumerName: 'orderCancelledConsumer',
    requiredPaths: ['order.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ORDER_CANCELLED_V1]: createConsumer({
    consumerName: 'orderCancelledV1Consumer',
    requiredPaths: ['order.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ORDER_READY_V1]: createConsumer({
    consumerName: 'orderReadyV1Consumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderReadyEvent,
  }),
  [EVENT_TYPES.ORDER_COMPLETED_V1]: createConsumer({
    consumerName: 'orderCompletedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: notificationService.handleOrderCompletedEvent,
  }),
  [EVENT_TYPES.PAYMENT_CREATED]: createConsumer({
    consumerName: 'paymentCreatedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.PAYMENT_SUCCESS]: createConsumer({
    consumerName: 'paymentSuccessConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.PAYMENT_SUCCESS_V1]: createConsumer({
    consumerName: 'paymentSuccessV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: notificationService.handlePaymentSuccessEvent,
  }),
  [EVENT_TYPES.PAYMENT_FAILED]: createConsumer({
    consumerName: 'paymentFailedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.PAYMENT_FAILED_V1]: createConsumer({
    consumerName: 'paymentFailedV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.PAYMENT_REFUNDED]: createConsumer({
    consumerName: 'paymentRefundedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.PAYMENT_CREATED_V1]: createConsumer({
    consumerName: 'paymentCreatedV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.PAYMENT_REFUNDED_V1]: createConsumer({
    consumerName: 'paymentRefundedV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.NOTIFICATION_CREATED_V1]: createConsumer({
    consumerName: 'notificationCreatedV1Consumer',
    requiredPaths: ['notification.notificationId'],
    formatter: (payload) => ({ notificationId: payload.notification.notificationId }),
  }),
  [EVENT_TYPES.NOTIFICATION_DELIVERED_V1]: createConsumer({
    consumerName: 'notificationDeliveredV1Consumer',
    requiredPaths: ['notification.notificationId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.NOTIFICATION_FAILED_V1]: createConsumer({
    consumerName: 'notificationFailedV1Consumer',
    requiredPaths: ['notification.notificationId'],
    formatter: (payload) => ({ notificationId: payload.notification.notificationId }),
  }),
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
    requiredPaths: ['reportDate', 'report.key'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.DAILY_REPORT_GENERATED_V1]: createConsumer({
    consumerName: 'dailyReportGeneratedV1Consumer',
    requiredPaths: ['reportDate', 'report.reportId'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ANALYTICS_UPDATED_V1]: createConsumer({
    consumerName: 'analyticsUpdatedV1Consumer',
    requiredPaths: ['report.reportId', 'report.reportType'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ADMIN_CONFIG_UPDATED_V1]: createConsumer({
    consumerName: 'adminConfigUpdatedV1Consumer',
    requiredPaths: ['config.adminItemId', 'config.entityType'],
    formatter: noopFormatter,
  }),
  [EVENT_TYPES.ADMIN_DASHBOARD_UPDATED_V1]: createConsumer({
    consumerName: 'adminDashboardUpdatedV1Consumer',
    requiredPaths: ['dashboard.adminItemId', 'dashboard.entityType'],
    formatter: noopFormatter,
  }),
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
