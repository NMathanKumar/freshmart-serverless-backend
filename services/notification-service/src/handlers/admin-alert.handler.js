const emailService = require('../email/email.service');
const { renderAdminAlertEmail } = require('../templates');

const handleAdminAlert = async (payload = {}, context = {}) => {
  const adminEmail = process.env.SUPPORT_EMAIL || 'support@freshmart.com';
  const detailType = context.detailType || payload.eventType || 'AdminAlert';

  const alertTitles = {
    'PaymentFailed.v1': 'Payment Failure Alert',
    'payment.failed': 'Payment Failure Alert',
    'OrderCancelled.v1': 'Order Cancellation Alert',
    'order.cancelled': 'Order Cancellation Alert',
    'LargeOrderPlaced.v1': 'High Value Order Notice',
    'order.large_placed': 'High Value Order Notice',
    'SuspiciousLogin.v1': 'Suspicious Login Security Alert',
    'customer.suspicious_login': 'Suspicious Login Security Alert',
  };

  const title = alertTitles[detailType] || `Admin Alert: ${detailType}`;
  const template = renderAdminAlertEmail({
    alertType: detailType,
    title,
    details: payload,
  });

  return emailService.processAndSendNotification({
    type: `ADMIN_ALERT_${detailType.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
    eventType: detailType,
    eventId: context.eventId,
    userId: 'ADMIN',
    recipientEmail: adminEmail,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleAdminAlert;
