const handleCustomerRegistered = require('../handlers/user-registered.handler');
const handleUserLoggedIn = require('../handlers/user-logged-in.handler');
const handleOrderPlaced = require('../handlers/order-placed.handler');
const handlePaymentSucceeded = require('../handlers/payment-succeeded.handler');
const handleOrderStatusUpdated = require('../handlers/order-status.handler');
const handlePasswordReset = require('../handlers/password-reset.handler');
const handleInventoryLow = require('../handlers/inventory-low.handler');
const handleAdminAlert = require('../handlers/admin-alert.handler');

/**
 * Enterprise Event Registry Map<detailType, Handler>
 * Eliminates switch statements and provides 100% O(1) dynamic handler lookup
 */
class EventRegistry {
  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  register(detailType, handler) {
    if (!detailType || typeof handler !== 'function') {
      throw new Error(`Invalid event registration for detailType '${detailType}'`);
    }
    this.handlers.set(detailType, handler);
  }

  getHandler(detailType) {
    return this.handlers.get(detailType) || null;
  }

  registerDefaultHandlers() {
    // 1. Customer Registered Events
    this.register('CustomerRegistered.v1', handleCustomerRegistered);
    this.register('customer.registered', handleCustomerRegistered);

    // 2. User Logged In Events
    this.register('UserLoggedIn.v1', handleUserLoggedIn);
    this.register('customer.logged_in', handleUserLoggedIn);

    // 3. Password Reset Events
    this.register('PasswordResetRequested.v1', handlePasswordReset);
    this.register('customer.password_reset', handlePasswordReset);

    // 4. Order Placed Events
    this.register('OrderPlaced.v1', handleOrderPlaced);
    this.register('order.placed', handleOrderPlaced);

    // 5. Payment Succeeded Events
    this.register('PaymentSucceeded.v1', handlePaymentSucceeded);
    this.register('payment.succeeded', handlePaymentSucceeded);

    // 6. Order Status Updated Events
    this.register('OrderStatusUpdated.v1', handleOrderStatusUpdated);
    this.register('order.status_updated', handleOrderStatusUpdated);
    this.register('order.accepted', handleOrderStatusUpdated);
    this.register('order.ready', handleOrderStatusUpdated);
    this.register('order.completed', handleOrderStatusUpdated);

    // 7. Low Inventory Events
    this.register('InventoryLow.v1', handleInventoryLow);
    this.register('inventory.low_stock', handleInventoryLow);

    // 8. Admin Alerts
    this.register('PaymentFailed.v1', handleAdminAlert);
    this.register('payment.failed', handleAdminAlert);
    this.register('OrderCancelled.v1', handleAdminAlert);
    this.register('order.cancelled', handleAdminAlert);
    this.register('LargeOrderPlaced.v1', handleAdminAlert);
    this.register('SuspiciousLogin.v1', handleAdminAlert);

    // 9. SES Bounce & Complaint Lifecycle Events
    const { handleBounceEvent } = require('../handlers/bounce.handler');
    const { handleComplaintEvent } = require('../handlers/complaint.handler');

    this.register('ses.bounce', handleBounceEvent);
    this.register('SESNotification.Bounce', handleBounceEvent);
    this.register('SES.Bounce', handleBounceEvent);
    this.register('Bounce', handleBounceEvent);

    this.register('ses.complaint', handleComplaintEvent);
    this.register('SESNotification.Complaint', handleComplaintEvent);
    this.register('SES.Complaint', handleComplaintEvent);
    this.register('Complaint', handleComplaintEvent);
  }
}

module.exports = new EventRegistry();
