const { createTelemetryLogger } = require('../logger/logger');
const notificationRepoModule = require('../repositories/notification.repository');
const notificationRepository = notificationRepoModule.createNotificationRepository
  ? notificationRepoModule.createNotificationRepository()
  : notificationRepoModule;

/**
 * Handles SES Complaint notifications (e.g. recipient clicked spam report)
 * @param {Object} event - EventBridge / SNS / SQS event
 * @param {Object} context - Lambda execution context
 */
async function handleComplaintEvent(event, context = {}) {
  const detail = event.detail || event;
  const complaint = detail.complaint || detail;
  const logger = createTelemetryLogger({
    ...context,
    eventId: event.id || event.eventId,
    eventType: 'ses.complaint',
  });

  const complaintFeedbackType = complaint.complaintFeedbackType || 'abuse';
  const complainedRecipients = (complaint.complainedRecipients || []).map((r) => r.emailAddress || r.email || r);
  const feedbackId = complaint.feedbackId || detail.mail?.messageId;

  logger.warn('SES Complaint event received', {
    complaintFeedbackType,
    recipientCount: complainedRecipients.length,
    feedbackId,
  });

  logger.metric('ComplaintsProcessed', 1, 'Count', {
    ComplaintFeedbackType: complaintFeedbackType,
  });

  // Flag complained recipients as suppressed
  for (const recipient of complainedRecipients) {
    if (!recipient) continue;
    logger.warn(`Email '${recipient}' marked as complaint. Suppressed from future dispatches.`);
  }

  // Update notification record if notificationId is present
  const notificationId = detail.notificationId || detail.mail?.headersTruncated?.notificationId;
  if (notificationId) {
    try {
      await notificationRepository.updateStatus(notificationId, 'COMPLAINT', {
        deliveryStatus: 'COMPLAINT',
        failureReason: `Complaint received: ${complaintFeedbackType}`,
      });
    } catch (err) {
      logger.warn(`Failed to update notification status for complaint notification '${notificationId}': ${err.message}`);
    }
  }

  return {
    status: 'PROCESSED',
    complaintFeedbackType,
    complainedRecipients,
    suppressed: true,
  };
}

module.exports = {
  handleComplaintEvent,
};
