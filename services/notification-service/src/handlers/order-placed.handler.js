const emailService = require('../email/email.service');
const { renderOrderPlacedEmail } = require('../templates');

const handleOrderPlaced = async (payload = {}, context = {}) => {
  // EventBridge → SNS → SQS unwrap chain:
  const data = payload.data || payload.payload || payload;
  const order = data.order || data.detail?.order || payload.order || payload.detail || payload;

  const email =
    order.customerEmail ||
    order.email ||
    order.userEmail ||
    order.deliveryAddressData?.email ||
    payload.customerEmail ||
    payload.email ||
    'nmadhankumar597@gmail.com';

  const name =
    order.customerName ||
    order.userName ||
    order.deliveryAddressData?.name ||
    payload.customerName ||
    'Valued Customer';

  const userId = order.customerId || order.userId || 'UNKNOWN';

  // Calculate items total if top-level total is missing or 0
  const itemsList = Array.isArray(order.items) ? order.items : [];
  const itemsSum = itemsList.reduce((sum, item) => {
    const itemPrice = Number(item.price || item.unitPrice || 0);
    const itemQty = Number(item.quantity || 1);
    const lineTotal = Number(item.lineTotal || item.totalPrice || itemPrice * itemQty);
    return sum + lineTotal;
  }, 0);

  const rawTotal =
    Number(order.totalAmount) ||
    Number(order.grandTotal) ||
    Number(order.total) ||
    Number(order.amount) ||
    0;

  const total = rawTotal > 0 ? rawTotal : (itemsSum > 0 ? itemsSum + 1.35 + 1.50 : 0);

  const template = renderOrderPlacedEmail({
    customerName: name,
    orderId: order.orderId || 'N/A',
    items: itemsList,
    total,
    currency: order.currency || 'INR',
    deliveryAddress:
      order.deliveryAddressData?.line1 ||
      order.deliveryAddress ||
      order.address ||
      'Registered Delivery Address',
    estimatedDelivery: order.estimatedDelivery || '15 Mins',
    paymentMethod: order.paymentMethod || 'Online Payment',
  });

  const textBody = `Order Confirmed - FreshMart
Hello ${name},

Thank you for your order! Your order #${order.orderId || 'N/A'} has been confirmed and will arrive in approximately 15 Mins.

Total Amount: ₹${Number(total).toFixed(2)}
Payment Method: ${order.paymentMethod || 'Online Payment'}
Delivery Address: ${order.deliveryAddressData?.line1 || order.deliveryAddress || 'Delivery Address'}

Track your order: ${process.env.FRONTEND_URL || 'https://freshmart.dev'}/orders

Thank you for shopping with FreshMart!`;

  return emailService.processAndSendNotification({
    type: 'ORDER_CONFIRMED',
    eventType: 'OrderPlaced.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    textBody,
    payload,
    context,
  });
};

module.exports = handleOrderPlaced;

