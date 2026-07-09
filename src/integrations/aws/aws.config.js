const config = require('../../core/config');

const awsConfig = {
  region: config.aws.region,
  s3Bucket: config.aws.s3Bucket,
  sns: {
    lowStockTopicArn: config.aws.sns.lowStockTopicArn,
    orderReadyTopicArn: config.aws.sns.orderReadyTopicArn,
    paymentSuccessTopicArn: config.aws.sns.paymentSuccessTopicArn,
    paymentFailureTopicArn: config.aws.sns.paymentFailureTopicArn,
  },
  sqs: {
    inventoryQueueUrl: config.aws.sqs.inventoryQueueUrl,
    emailQueueUrl: config.aws.sqs.emailQueueUrl,
    analyticsQueueUrl: config.aws.sqs.analyticsQueueUrl,
    inventoryDeadLetterQueueUrl: config.aws.sqs.inventoryDeadLetterQueueUrl,
    emailDeadLetterQueueUrl: config.aws.sqs.emailDeadLetterQueueUrl,
    analyticsDeadLetterQueueUrl: config.aws.sqs.analyticsDeadLetterQueueUrl,
  },
};

module.exports = awsConfig;
