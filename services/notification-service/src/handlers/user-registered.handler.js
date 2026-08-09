const emailService = require('../email/email.service');
const { renderWelcomeNewCustomerEmail } = require('../templates');

const handleCustomerRegistered = async (payload = {}, context = {}) => {
  const user = payload.user || payload.customer || payload.detail || payload;
  const email = user.email || user.customerEmail;
  const name = user.name || user.customerName || 'Valued Customer';
  const userId = user.userId || user.customerId || 'UNKNOWN';

  if (!email) {
    throw new Error("Missing required email in 'CustomerRegistered.v1' event payload");
  }

  const template = renderWelcomeNewCustomerEmail({ customerName: name });

  return emailService.processAndSendNotification({
    type: 'WELCOME_NEW_CUSTOMER',
    eventType: 'CustomerRegistered.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleCustomerRegistered;
