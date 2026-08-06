const { genId } = require('@freshmart/service-shared').utils.id;
const sesProvider = require('../providers/ses.provider');
const idempotencyRepository = require('../repository/idempotency.repository');
const notificationRepository = require('../repositories/notification.repository');
const { createTelemetryLogger } = require('../logger/logger');

class EmailService {
  /**
   * Orchestrates complete email notification flow: Idempotency -> Persist -> SES Send -> Update Status
   */
  async processAndSendNotification({
    type,
    eventType,
    eventId,
    userId = 'SYSTEM',
    recipientEmail,
    subject,
    htmlBody,
    payload = {},
    context = {},
  }) {
    const logger = createTelemetryLogger({ ...context, eventId, userId });

    // 1. Idempotency Check
    if (eventId) {
      const isDuplicate = await idempotencyRepository.isProcessed(eventId);
      if (isDuplicate) {
        logger.info(`Duplicate eventId '${eventId}' suppressed by idempotency guard. Skipping email dispatch.`);
        logger.metric('DuplicateEventsSuppressed', 1, 'Count');
        return {
          status: 'SKIPPED_DUPLICATE',
          eventId,
        };
      }
    }

    const notificationId = genId('NOTIF');
    const recipient = {
      userId,
      email: recipientEmail,
    };

    // 2. Persist initial QUEUED notification in DynamoDB
    let notificationRecord;
    try {
      notificationRecord = await notificationRepository.create({
        notificationId,
        userId,
        type,
        channel: 'SES',
        subject,
        message: subject,
        payload,
        status: 'SENDING',
        eventType,
        correlationId: context.correlationId || null,
        requestId: context.requestId || null,
      });
    } catch (err) {
      logger.warn(`Failed to persist initial notification record: ${err.message}`);
    }

    // 3. Dispatch Email via AWS SES
    try {
      const sesResult = await sesProvider.sendEmail({
        to: recipientEmail,
        subject,
        htmlBody,
        context: { ...context, notificationId, eventId },
      });

      // 4. Update status to DELIVERED
      if (notificationRecord) {
        await notificationRepository.updateStatus(notificationId, 'DELIVERED', {
          deliveredAt: new Date().toISOString(),
          attemptCount: sesResult.attempt,
        });
      }

      // Mark eventId processed for idempotency
      if (eventId) {
        await idempotencyRepository.markProcessed(eventId, { type, recipientEmail });
      }

      return {
        status: 'DELIVERED',
        notificationId,
        messageId: sesResult.messageId,
      };
    } catch (error) {
      logger.error(`Email dispatch failed for notification '${notificationId}': ${error.message}`);

      if (notificationRecord) {
        await notificationRepository.updateStatus(notificationId, 'FAILED', {
          failureReason: error.message,
        });
      }

      return {
        status: 'FAILED',
        notificationId,
        error: error.message,
      };
    }
  }
}

module.exports = new EmailService();
