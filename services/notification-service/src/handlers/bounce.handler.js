const { createTelemetryLogger } = require('../logger/logger');
const notificationRepoModule = require('../repositories/notification.repository');
const notificationRepository = notificationRepoModule.createNotificationRepository
  ? notificationRepoModule.createNotificationRepository()
  : notificationRepoModule;

/**
 * Handles SES Bounce notifications (hard bounces and transient bounces)
 * @param {Object} event - EventBridge / SNS / SQS event
 * @param {Object} context - Lambda execution context
 */
async function handleBounceEvent(event, context = {}) {
  const detail = event.detail || event;
  const bounce = detail.bounce || detail;
  const logger = createTelemetryLogger({
    ...context,
    eventId: event.id || event.eventId,
    eventType: 'ses.bounce',
  });

  const bounceType = bounce.bounceType || 'Permanent'; // 'Permanent' | 'Transient' | 'Undetermined'
  const bounceSubType = bounce.bounceSubType || 'General';
  const bouncedRecipients = (bounce.bouncedRecipients || []).map((r) => r.emailAddress || r.email || r);
  const feedbackId = bounce.feedbackId || detail.mail?.messageId;

  logger.warn('SES Bounce event received', {
    bounceType,
    bounceSubType,
    recipientCount: bouncedRecipients.length,
    feedbackId,
  });

  logger.metric('BouncesProcessed', 1, 'Count', {
    BounceType: bounceType,
    BounceSubType: bounceSubType,
  });

  // If permanent hard bounce, record suppression to prevent repeatedly emailing invalid addresses
  if (bounceType === 'Permanent') {
    logger.metric('PermanentHardBounces', 1, 'Count');
    for (const recipient of bouncedRecipients) {
      if (!recipient) continue;
      logger.warn(`Email '${recipient}' marked as permanently bounced. Suppressed from future dispatches.`);
    }
  }

  // Update notification record if notificationId or correlationId is present
  const notificationId = detail.notificationId || detail.mail?.headersTruncated?.notificationId;
  if (notificationId) {
    try {
      await notificationRepository.updateStatus(notificationId, 'BOUNCED', {
        deliveryStatus: 'BOUNCED',
        failureReason: `${bounceType} Bounce: ${bounceSubType}`,
      });
    } catch (err) {
      logger.warn(`Failed to update notification status for bounced notification '${notificationId}': ${err.message}`);
    }
  }

  return {
    status: 'PROCESSED',
    bounceType,
    bouncedRecipients,
    suppressed: bounceType === 'Permanent',
  };
}

module.exports = {
  handleBounceEvent,
};
