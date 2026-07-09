const { PublishCommand } = require('@aws-sdk/client-sns');
const logger = require('../../core/utils/logger');
const awsConfig = require('../aws/aws.config');
const { snsClient } = require('../aws/aws.client');
const { awsOperationError } = require('../aws/aws.errors');
const { logAwsRequest, logAwsFailure } = require('../aws/aws.logger');

const ensureTopicArn = (topicArn, topicName) => {
  if (!topicArn) {
    return null;
  }
  return topicArn;
};

const mockPublish = (operation, subject, payload) => {
  logger.info(`Mock SNS ${operation}`, { subject, payload });
  return {
    messageId: `mock-msg-${Date.now()}`,
    sequenceNumber: null,
    requestId: `mock-req-${Date.now()}`,
  };
};

const sendSnsPublish = async (operation, topicArn, payload, subject, failureMessage) => {
  if (!topicArn) {
    return mockPublish(operation, subject, payload);
  }
  const request = { TopicArn: topicArn, subject };
  try {
    const message = JSON.stringify(payload);
    const response = await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Subject: subject,
        Message: message,
      })
    );

    logAwsRequest({
      service: 'sns',
      operation,
      requestId: response?.$metadata?.requestId,
      request,
      response: {
        messageId: response?.MessageId,
        sequenceNumber: response?.SequenceNumber,
        httpStatusCode: response?.$metadata?.httpStatusCode,
      },
    });

    return {
      messageId: response?.MessageId || null,
      sequenceNumber: response?.SequenceNumber || null,
      requestId: response?.$metadata?.requestId || null,
    };
  } catch (error) {
    logAwsFailure({
      service: 'sns',
      operation,
      requestId: error?.$metadata?.requestId,
      request,
      error,
    });
    throw awsOperationError(failureMessage);
  }
};

const publishLowStock = async (payload = {}) =>
  sendSnsPublish(
    'PublishLowStock',
    ensureTopicArn(awsConfig.sns.lowStockTopicArn, 'low stock alerts'),
    payload,
    'Low Stock Alert',
    'Failed to publish low stock notification via SNS'
  );

const publishOrderReady = async (payload = {}) =>
  sendSnsPublish(
    'PublishOrderReady',
    ensureTopicArn(awsConfig.sns.orderReadyTopicArn, 'order ready notifications'),
    payload,
    'Order Ready',
    'Failed to publish order ready notification via SNS'
  );

const publishPaymentSuccess = async (payload = {}) =>
  sendSnsPublish(
    'PublishPaymentSuccess',
    ensureTopicArn(awsConfig.sns.paymentSuccessTopicArn, 'payment success notifications'),
    payload,
    'Payment Success',
    'Failed to publish payment success notification via SNS'
  );

const publishPaymentFailure = async (payload = {}) =>
  sendSnsPublish(
    'PublishPaymentFailure',
    ensureTopicArn(awsConfig.sns.paymentFailureTopicArn, 'payment failure notifications'),
    payload,
    'Payment Failure',
    'Failed to publish payment failure notification via SNS'
  );

const publishNotification = async (payload = {}) =>
  sendSnsPublish(
    'PublishNotification',
    ensureTopicArn(awsConfig.sns.notificationTopicArn, 'notification messages'),
    payload,
    'Notification',
    'Failed to publish notification message via SNS'
  );

const publishOrderPlacedNotification = async (payload = {}) =>
  sendSnsPublish(
    'PublishOrderPlacedNotification',
    ensureTopicArn(awsConfig.sns.orderPlacedTopicArn, 'order placed notifications'),
    payload,
    'New Order',
    'Failed to publish order placed notification via SNS'
  );

const publishReportNotification = async (payload = {}) =>
  sendSnsPublish(
    'PublishReportNotification',
    ensureTopicArn(awsConfig.sns.reportTopicArn, 'report notifications'),
    payload,
    'Daily Report Ready',
    'Failed to publish report notification via SNS'
  );

module.exports = {
  publishLowStock,
  publishOrderPlacedNotification,
  publishOrderReady,
  publishPaymentSuccess,
  publishPaymentFailure,
  publishNotification,
  publishReportNotification,
};
