const emailService = require('../email/email.service');
const { renderOrderStatusEmail } = require('../templates');

const handleOrderStatusUpdated = async (payload = {}, context = {}) => {
  const order = payload.order || payload.detail || payload;
  const email = order.customerEmail || order.email;
  const name = order.customerName || 'Valued Customer';
  const userId = order.customerId || order.userId || 'UNKNOWN';
  const status = (order.status || 'CONFIRMED').toUpperCase();

  if (!email) {
    throw new Error("Missing required customer email in 'OrderStatusUpdated.v1' event payload");
  }

  const descriptions = {
    PENDING: 'Your order has been received and is pending confirmation.',
    CONFIRMED: 'Your order has been confirmed by FreshMart store.',
    PLACED: 'Your order has been placed and is being reviewed.',
    ACCEPTED: 'Your order has been accepted and will start preparing shortly.',
    PREPARING: 'Great news! Our team is now preparing your fresh groceries.',
    PACKED: 'Your order has been packed and is ready for pickup by delivery partner.',
    READY: 'Your order is packed and ready — a delivery partner will pick it up shortly!',
    SHIPPED: 'Your order has left our dark store and is on its way.',
    OUT_FOR_DELIVERY: 'Your order is out for delivery! Our delivery partner is on the way to you.',
    DELIVERED: 'Your order has been delivered successfully. Enjoy your fresh groceries!',
    CANCELLED: 'Your order has been cancelled.',
  };

  const statusLabels = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PLACED: 'Order Placed',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    PACKED: 'Packed',
    READY: 'Ready for Dispatch',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  const template = renderOrderStatusEmail({
    customerName: name,
    orderId: order.orderId || 'N/A',
    status,
    statusLabel: statusLabels[status] || status,
    description: descriptions[status] || `Your order status is now ${status}.`,
  });

  return emailService.processAndSendNotification({
    type: `ORDER_STATUS_${status}`,
    eventType: 'OrderStatusUpdated.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleOrderStatusUpdated;
