const EVENT_VERSION = '1.0.0';

// Consumer event type constants.
// These MUST match the detail-type values that publishers send to EventBridge.
// Publishers use packages/shared/src/events/constants.js which uses dot-notation.
// The consumer router keys on these values, so they must be identical.

const EVENT_TYPES = Object.freeze({
  // Product events (publishers send "product.*")
  FOOD_CREATED: 'product.created',
  FOOD_UPDATED: 'product.updated',
  FOOD_DELETED: 'product.deleted',
  FOOD_AVAILABILITY_CHANGED: 'product.availability_changed',

  // Cart events
  CART_ITEM_ADDED: 'cart.item_added',
  CART_ITEM_UPDATED: 'cart.item_updated',
  CART_ITEM_REMOVED: 'cart.item_removed',
  CART_CLEARED: 'cart.cleared',

  // Inventory events
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_LOW: 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK: 'inventory.out_of_stock',
  INVENTORY_RESTOCKED: 'inventory.restocked',

  // Order events
  ORDER_PLACED: 'order.placed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_ACCEPTED: 'order.accepted',
  ORDER_READY: 'order.ready',
  ORDER_COMPLETED: 'order.completed',

  // Versioned order events (match the same detail-type as non-versioned for now)
  ORDER_PLACED_V1: 'order.placed',
  ORDER_CANCELLED_V1: 'order.cancelled',
  ORDER_ACCEPTED_V1: 'order.accepted',
  ORDER_READY_V1: 'order.ready',
  ORDER_COMPLETED_V1: 'order.completed',

  // Payment events
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_SUCCESS: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_CREATED_V1: 'payment.created',
  PAYMENT_SUCCESS_V1: 'payment.succeeded',
  PAYMENT_FAILED_V1: 'payment.failed',
  PAYMENT_REFUNDED_V1: 'payment.refunded',

  // User/Customer events
  USER_REGISTERED: 'customer.registered',
  USER_REGISTERED_V1: 'customer.registered',
  USER_LOGGED_IN_V1: 'customer.logged_in',
  USER_LOGGED_OUT_V1: 'customer.logged_out',

  // Inventory versioned
  INVENTORY_LOW_V1: 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK_V1: 'inventory.out_of_stock',

  // Notification events
  NOTIFICATION_CREATED_V1: 'notification.created',
  NOTIFICATION_DELIVERED_V1: 'notification.delivered',
  NOTIFICATION_FAILED_V1: 'notification.failed',

  // Analytics events
  ANALYTICS_UPDATED_V1: 'analytics.updated',

  // Admin events
  ADMIN_CONFIG_UPDATED_V1: 'admin.config_updated',
  ADMIN_DASHBOARD_UPDATED_V1: 'admin.dashboard_updated',

  // Infrastructure events
  S3_OBJECT_CREATED: 's3.object_created',
  IMAGE_PROCESSED: 'image.processed',
  INVOICE_UPLOADED: 'invoice.uploaded',

  // Scheduled/batch events
  DAILY_ANALYTICS_SCHEDULED: 'analytics.daily_scheduled',
  DAILY_REPORT_GENERATED: 'analytics.daily_report_generated',
  DAILY_REPORT_GENERATED_V1: 'analytics.daily_report_generated',
  RESTOCK_JOB_QUEUED: 'inventory.restock_job_queued',
});

module.exports = {
  EVENT_VERSION,
  EVENT_TYPES,
};
