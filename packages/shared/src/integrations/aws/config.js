const config = require('../../config');

module.exports = {
  region: config.aws.region,
  s3Bucket: config.aws.s3Bucket,
  sns: {
    lowStockTopicArn: config.aws.sns.lowStockTopicArn,
    orderPlacedTopicArn: config.aws.sns.orderPlacedTopicArn,
    orderReadyTopicArn: config.aws.sns.orderReadyTopicArn,
    paymentSuccessTopicArn: config.aws.sns.paymentSuccessTopicArn,
    paymentFailureTopicArn: config.aws.sns.paymentFailureTopicArn,
    notificationTopicArn: config.aws.sns.notificationTopicArn,
    reportTopicArn: config.aws.sns.reportTopicArn,
  },
  sqs: {
    inventoryQueueUrl: config.aws.sqs.inventoryQueueUrl,
    emailQueueUrl: config.aws.sqs.emailQueueUrl,
    notificationQueueUrl: config.aws.sqs.notificationQueueUrl,
    analyticsQueueUrl: config.aws.sqs.analyticsQueueUrl,
    inventoryDeadLetterQueueUrl: config.aws.sqs.inventoryDeadLetterQueueUrl,
    emailDeadLetterQueueUrl: config.aws.sqs.emailDeadLetterQueueUrl,
    notificationDeadLetterQueueUrl: config.aws.sqs.notificationDeadLetterQueueUrl,
    analyticsDeadLetterQueueUrl: config.aws.sqs.analyticsDeadLetterQueueUrl,
  },
};
