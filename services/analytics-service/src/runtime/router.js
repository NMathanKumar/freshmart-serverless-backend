const { BadRequestError } = require('@freshmart/shared').errors;
const { EVENT_TYPES } = require('../events/constants');
const { buildSuccessResponse, assertRequiredPaths } = require('./utils');
const workflowService = require('../workflows/enterprise-workflow.service');
// TODO: Replace direct service imports with EventBridge or HTTP API boundaries.
const inventoryService = require('@freshmart/inventory-service/src/services/inventory.service');
const cartService = require('@freshmart/cart-service/src/services/cart.service');
const orderService = require('@freshmart/order-service/src/services/order.service');
const paymentService = require('@freshmart/payment-service/src/services/payment.service');
const notificationService = require('@freshmart/notification-runtime');
const analyticsService = require('../services/analytics.service');
const adminService = require('@freshmart/admin-service/src/services/admin.service');

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
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleUserRegisteredEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handleUserRegisteredEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.USER_REGISTERED_V1, payload, runtimeContext);
      return {
        notificationResult,
        analyticsResult,
        adminResult,
      };
    },
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
    action: cartService.handleFoodAvailabilityChanged,
  }),
  [EVENT_TYPES.FOOD_DELETED]: createConsumer({
    consumerName: 'foodDeletedConsumer',
    requiredPaths: ['foodId'],
    action: cartService.handleFoodDeleted,
  }),
  [EVENT_TYPES.INVENTORY_UPDATED]: createConsumer({
    consumerName: 'inventoryUpdatedConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: cartService.handleInventoryUpdated,
  }),
  [EVENT_TYPES.INVENTORY_LOW]: createConsumer({
    consumerName: 'inventoryLowConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    formatter: (payload) => ({ inventoryId: payload.inventory.inventoryId, foodId: payload.inventory.foodId }),
  }),
  [EVENT_TYPES.INVENTORY_LOW_V1]: createConsumer({
    consumerName: 'inventoryLowV1Consumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleInventoryLowEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handleInventoryLowEvent(payload, runtimeContext);
      return {
        notificationResult,
        analyticsResult,
      };
    },
  }),
  [EVENT_TYPES.INVENTORY_OUT_OF_STOCK]: createConsumer({
    consumerName: 'inventoryOutOfStockConsumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: workflowService.processInventoryOutOfStock,
  }),
  [EVENT_TYPES.INVENTORY_OUT_OF_STOCK_V1]: createConsumer({
    consumerName: 'inventoryOutOfStockV1Consumer',
    requiredPaths: ['inventory.inventoryId', 'inventory.foodId'],
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleInventoryOutOfStockEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handleInventoryOutOfStockEvent(payload, runtimeContext);
      return {
        notificationResult,
        analyticsResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_PLACED]: createConsumer({
    consumerName: 'orderPlacedConsumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const workflowResult = await workflowService.processOrderPlaced(payload, runtimeContext);
      const inventoryResult = await inventoryService.handleOrderPlacedEvent(payload, runtimeContext);
      return {
        workflowResult,
        inventoryResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_PLACED_V1]: createConsumer({
    consumerName: 'orderPlacedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const workflowResult = await workflowService.processOrderPlaced(payload, runtimeContext);
      const inventoryResult = await inventoryService.handleOrderPlacedEvent(payload, runtimeContext);
      const paymentResult = await paymentService.handleOrderPlacedEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handleOrderPlacedEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ORDER_PLACED_V1, payload, runtimeContext);
      return {
        workflowResult,
        inventoryResult,
        paymentResult,
        analyticsResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_ACCEPTED]: createConsumer({
    consumerName: 'orderAcceptedConsumer',
    requiredPaths: ['order.orderId'],
    formatter: (payload) => ({ orderId: payload.order.orderId }),
  }),
  [EVENT_TYPES.ORDER_ACCEPTED_V1]: createConsumer({
    consumerName: 'orderAcceptedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleOrderAcceptedEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ORDER_ACCEPTED_V1, payload, runtimeContext);
      return {
        notificationResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_CANCELLED]: createConsumer({
    consumerName: 'orderCancelledConsumer',
    requiredPaths: ['order.orderId'],
    action: inventoryService.handleOrderCancelledEvent,
  }),
  [EVENT_TYPES.ORDER_CANCELLED_V1]: createConsumer({
    consumerName: 'orderCancelledV1Consumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const analyticsResult = await analyticsService.handleOrderCancelledEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ORDER_CANCELLED_V1, payload, runtimeContext);
      return {
        analyticsResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_READY_V1]: createConsumer({
    consumerName: 'orderReadyV1Consumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleOrderReadyEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ORDER_READY_V1, payload, runtimeContext);
      return {
        notificationResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.ORDER_COMPLETED_V1]: createConsumer({
    consumerName: 'orderCompletedV1Consumer',
    requiredPaths: ['order.orderId'],
    action: async (payload, runtimeContext) => {
      const notificationResult = await notificationService.handleOrderCompletedEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handleOrderCompletedEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ORDER_COMPLETED_V1, payload, runtimeContext);
      return {
        notificationResult,
        analyticsResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.PAYMENT_CREATED]: createConsumer({
    consumerName: 'paymentCreatedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    formatter: (payload) => ({ paymentId: payload.payment.paymentId, orderId: payload.payment.orderId }),
  }),
  [EVENT_TYPES.PAYMENT_SUCCESS]: createConsumer({
    consumerName: 'paymentSuccessConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: orderService.handlePaymentSuccess,
  }),
  [EVENT_TYPES.PAYMENT_SUCCESS_V1]: createConsumer({
    consumerName: 'paymentSuccessV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: async (payload, runtimeContext) => {
      const orderResult = await orderService.handlePaymentSuccess(payload, runtimeContext);
      const workflowResult = await workflowService.processPaymentSuccess(payload, runtimeContext);
      const notificationResult = await notificationService.handlePaymentSuccessEvent(payload, runtimeContext);
      const analyticsResult = await analyticsService.handlePaymentSuccessEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.PAYMENT_SUCCESS_V1, payload, runtimeContext);
      return {
        orderResult,
        workflowResult,
        notificationResult,
        analyticsResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.PAYMENT_FAILED]: createConsumer({
    consumerName: 'paymentFailedConsumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: orderService.handlePaymentFailed,
  }),
  [EVENT_TYPES.PAYMENT_FAILED_V1]: createConsumer({
    consumerName: 'paymentFailedV1Consumer',
    requiredPaths: ['payment.paymentId', 'payment.orderId'],
    action: async (payload, runtimeContext) => {
      const orderResult = await orderService.handlePaymentFailed(payload, runtimeContext);
      const analyticsResult = await analyticsService.handlePaymentFailedEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.PAYMENT_FAILED_V1, payload, runtimeContext);
      return {
        orderResult,
        analyticsResult,
        adminResult,
      };
    },
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
    action: async (payload, runtimeContext) => {
      const analyticsResult = await analyticsService.handleNotificationDeliveredEvent(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.NOTIFICATION_DELIVERED_V1, payload, runtimeContext);
      return {
        analyticsResult,
        adminResult,
      };
    },
  }),
  [EVENT_TYPES.NOTIFICATION_FAILED_V1]: createConsumer({
    consumerName: 'notificationFailedV1Consumer',
    requiredPaths: ['notification.notificationId'],
    formatter: (payload) => ({ notificationId: payload.notification.notificationId }),
  }),
  [EVENT_TYPES.DAILY_ANALYTICS_SCHEDULED]: createConsumer({
    consumerName: 'dailyAnalyticsScheduledConsumer',
    requiredPaths: ['reportDate'],
    action: async (payload, runtimeContext) => {
      const analyticsResult = await analyticsService.generateDailyReport(payload, runtimeContext);
      const workflowResult = await workflowService.processDailyAnalyticsScheduled(payload, runtimeContext);
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.DAILY_REPORT_GENERATED_V1, {
        reportDate: payload.reportDate,
        report: { reportId: analyticsResult?.reportId || null, reportType: 'DAILY' },
      }, runtimeContext);
      return {
        analyticsResult,
        workflowResult,
        adminResult,
      };
    },
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
    action: async (payload, runtimeContext) => {
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.DAILY_REPORT_GENERATED_V1, payload, runtimeContext);
      return { adminResult };
    },
  }),
  [EVENT_TYPES.ANALYTICS_UPDATED_V1]: createConsumer({
    consumerName: 'analyticsUpdatedV1Consumer',
    requiredPaths: ['report.reportId', 'report.reportType'],
    action: async (payload, runtimeContext) => {
      const adminResult = await adminService.handleDomainEvent(EVENT_TYPES.ANALYTICS_UPDATED_V1, payload, runtimeContext);
      return { adminResult };
    },
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
