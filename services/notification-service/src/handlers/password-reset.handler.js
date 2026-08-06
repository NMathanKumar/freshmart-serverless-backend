const emailService = require('../email/email.service');
const { renderPasswordResetEmail } = require('../templates');

const handlePasswordReset = async (payload = {}, context = {}) => {
  const user = payload.user || payload.detail || payload;
  const email = user.email || user.customerEmail;
  const name = user.name || 'Valued Customer';
  const userId = user.userId || 'UNKNOWN';
  const frontendUrl = process.env.FRONTEND_URL || 'https://freshmart.dev';

  if (!email) {
    throw new Error("Missing required email in 'PasswordResetRequested.v1' event payload");
  }

  const resetUrl = user.resetUrl || `${frontendUrl}/forgot-password?token=${user.token || 'reset'}`;
  const template = renderPasswordResetEmail({ customerName: name, resetTokenUrl: resetUrl });

  return emailService.processAndSendNotification({
    type: 'PASSWORD_RESET',
    eventType: 'PasswordResetRequested.v1',
    eventId: context.eventId,
    userId,
    recipientEmail: email,
    subject: template.subject,
    htmlBody: template.html,
    payload,
    context,
  });
};

module.exports = handlePasswordReset;
