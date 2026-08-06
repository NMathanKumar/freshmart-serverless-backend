const emailService = require('../email/email.service');
const { renderOrderPlacedEmail } = require('../templates');

const handleOrderPlaced = async (payload = {}, context = {}) => {
  const order = payload.order || payload.detail || payload;
  const email = order.customerEmail || order.email || order.userEmail;
  const name = order.customerName || order.userName || 'Valued Customer';
  const userId = order.customerId || order.userId || 'UNKNOWN';

  if (!email) {
    throw new Error("Missing required customer email in 'OrderPlaced.v1' event payload");
  }

  const template = renderOrderPlacedEmail({
    customerName: name,
    orderId: order.orderId || 'N/A',
    items: order.items || [],
    total: order.total || order.grandTotal || order.amount || 0,
    currency: order.currency || 'INR',
    deliveryAddress: order.deliveryAddress || order.address || 'Delivery Address',
    estimatedDelivery: order.estimatedDelivery || '15 Mins',
    paymentMethod: order.paymentMethod || 'UPI',
  });

  return emailService.processAndSendNotification({
    type: 'ORDER_CONFIRMED',
    eventType: 'OrderPlaced.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleOrderPlaced;
