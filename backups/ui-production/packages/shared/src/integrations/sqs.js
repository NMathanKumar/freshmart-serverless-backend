const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const logger = require('../utils/logger');
const awsConfig = require('./aws/config');
const { sqsClient } = require('./aws/client');
const { awsOperationError } = require('./aws/errors');
const { logAwsRequest, logAwsFailure } = require('./aws/logger');
const { BadRequestError } = require('../errors/ApiError');
const { genId } = require('../utils/id');

const getDeadLetterQueueUrl = (queueName) => {
  if (queueName === 'inventory queue') return awsConfig.sqs.inventoryDeadLetterQueueUrl || null;
  if (queueName === 'email notification queue') return awsConfig.sqs.emailDeadLetterQueueUrl || null;
  if (queueName === 'notification queue') return awsConfig.sqs.notificationDeadLetterQueueUrl || null;
  if (queueName === 'analytics queue') return awsConfig.sqs.analyticsDeadLetterQueueUrl || null;
  return null;
};

const ensureQueueUrl = (queueUrl) => (queueUrl ? queueUrl : null);
const buildMessage = (payload) => JSON.stringify(payload || {});

const sendSqsMessage = async ({
  operation,
  queueUrl,
  payload,
  messageGroupId,
  messageDeduplicationId,
  queueName,
  failureMessage,
}) => {
  const resolvedQueueUrl = ensureQueueUrl(queueUrl, queueName);
  if (!resolvedQueueUrl) {
    logger.info(`Mock SQS ${operation}`, { queueName, payload });
    return {
      messageId: `mock-msg-${Date.now()}`,
      md5OfMessageBody: null,
      sequenceNumber: null,
      requestId: `mock-req-${Date.now()}`,
      queueUrl: null,
    };
  }
  const request = {
    QueueUrl: resolvedQueueUrl,
    messageGroupId: messageGroupId || null,
  };

  try {
    const isFifo = resolvedQueueUrl.endsWith('.fifo');
    if (isFifo && !messageGroupId) {
      throw new BadRequestError(`${queueName} requires a MessageGroupId because it uses FIFO delivery`);
    }

    const response = await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: resolvedQueueUrl,
        MessageBody: buildMessage(payload),
        MessageGroupId: isFifo ? messageGroupId : undefined,
        MessageDeduplicationId: isFifo ? messageDeduplicationId || genId('DEDUP') : undefined,
      })
    );

    logAwsRequest({
      service: 'sqs',
      operation,
      requestId: response?.$metadata?.requestId,
      request,
      response: {
        messageId: response?.MessageId,
        md5OfMessageBody: response?.MD5OfMessageBody,
        sequenceNumber: response?.SequenceNumber,
        httpStatusCode: response?.$metadata?.httpStatusCode,
        deadLetterQueueUrl: getDeadLetterQueueUrl(queueName),
      },
    });

    return {
      messageId: response?.MessageId || null,
      md5OfMessageBody: response?.MD5OfMessageBody || null,
      sequenceNumber: response?.SequenceNumber || null,
      requestId: response?.$metadata?.requestId || null,
      queueUrl: resolvedQueueUrl,
    };
  } catch (error) {
    logAwsFailure({
      service: 'sqs',
      operation,
      requestId: error?.$metadata?.requestId,
      request,
      error,
    });
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw awsOperationError(failureMessage);
  }
};

const enqueueInventoryEvent = async (payload = {}) =>
  sendSqsMessage({
    operation: 'EnqueueInventoryEvent',
    queueUrl: awsConfig.sqs.inventoryQueueUrl,
    payload,
    queueName: 'inventory queue',
    messageGroupId: payload.foodId || payload.inventoryId || 'inventory',
    messageDeduplicationId: payload.eventId || genId('INVMSG'),
    failureMessage: 'Failed to enqueue inventory event via SQS',
  });

const enqueueEmailNotification = async (payload = {}) =>
  sendSqsMessage({
    operation: 'EnqueueEmailNotification',
    queueUrl: awsConfig.sqs.emailQueueUrl,
    payload,
    queueName: 'email notification queue',
    messageGroupId: payload.userId || 'email-notifications',
    messageDeduplicationId: payload.eventId || genId('EMAILMSG'),
    failureMessage: 'Failed to enqueue email notification via SQS',
  });

const enqueueNotificationRetry = async (payload = {}) =>
  sendSqsMessage({
    operation: 'EnqueueNotificationRetry',
    queueUrl: awsConfig.sqs.notificationQueueUrl,
    payload,
    queueName: 'notification queue',
    messageGroupId: payload.userId || payload.notificationId || 'notifications',
    messageDeduplicationId: payload.eventId || genId('NOTIFMSG'),
    failureMessage: 'Failed to enqueue notification retry via SQS',
  });

const enqueueAnalyticsJob = async (payload = {}) =>
  sendSqsMessage({
    operation: 'EnqueueAnalyticsJob',
    queueUrl: awsConfig.sqs.analyticsQueueUrl,
    payload,
    queueName: 'analytics queue',
    messageGroupId: payload.jobType || 'analytics',
    messageDeduplicationId: payload.eventId || genId('ANALYTICSMSG'),
    failureMessage: 'Failed to enqueue analytics job via SQS',
  });

module.exports = {
  enqueueInventoryEvent,
  enqueueEmailNotification,
  enqueueNotificationRetry,
  enqueueAnalyticsJob,
};
