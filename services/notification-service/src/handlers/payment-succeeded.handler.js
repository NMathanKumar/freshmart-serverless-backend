const emailService = require('../email/email.service');
const { renderPaymentSuccessEmail } = require('../templates');

const handlePaymentSucceeded = async (payload = {}, context = {}) => {
  const payment = payload.payment || payload.detail || payload;
  const email = payment.customerEmail || payment.email;
  const name = payment.customerName || 'Valued Customer';
  const userId = payment.customerId || payment.userId || 'UNKNOWN';

  if (!email) {
    throw new Error("Missing required customer email in 'PaymentSucceeded.v1' event payload");
  }

  const template = renderPaymentSuccessEmail({
    customerName: name,
    orderId: payment.orderId || 'N/A',
    paymentId: payment.paymentId || 'PAY-UNKNOWN',
    amount: payment.amount || 0,
    paymentMethod: payment.paymentMethod || 'Online Payment',
  });

  return emailService.processAndSendNotification({
    type: 'PAYMENT_SUCCESS',
    eventType: 'PaymentSucceeded.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handlePaymentSucceeded;
