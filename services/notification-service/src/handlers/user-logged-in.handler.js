const emailService = require('../email/email.service');
const { renderWelcomeBackEmail } = require('../templates');

const handleUserLoggedIn = async (payload = {}, context = {}) => {
  const user = payload.user || payload.customer || payload.detail || payload;
  const email = user.email || user.customerEmail;
  const name = user.name || user.customerName || 'Valued Customer';
  const userId = user.userId || user.customerId || 'UNKNOWN';

  if (!email) {
    throw new Error("Missing required email in 'UserLoggedIn.v1' event payload");
  }

  const template = renderWelcomeBackEmail({
    customerName: name,
    loginTime: payload.timestamp || context.timestamp,
    device: user.device || payload.device || 'Web Client',
    ip: user.ip || payload.ip || 'N/A',
  });

  return emailService.processAndSendNotification({
    type: 'WELCOME_BACK',
    eventType: 'UserLoggedIn.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handleUserLoggedIn;
