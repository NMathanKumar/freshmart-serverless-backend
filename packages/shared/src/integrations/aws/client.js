const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const awsConfig = require('./config');

const clientOptions = {
  region: awsConfig.region,
};

const s3Client = new S3Client(clientOptions);
const snsClient = new SNSClient(clientOptions);
const sqsClient = new SQSClient(clientOptions);
const eventBridgeClient = new EventBridgeClient(clientOptions);

module.exports = {
  s3Client,
  snsClient,
  sqsClient,
  eventBridgeClient,
};
