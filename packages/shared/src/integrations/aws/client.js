const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const awsConfig = require('./config');

const clientOptions = {
  region: awsConfig.region,
};

let s3Client;
let snsClient;
let sqsClient;
let eventBridgeClient;

module.exports = {
  get s3Client() {
    if (!s3Client) s3Client = new S3Client(clientOptions);
    return s3Client;
  },
  get snsClient() {
    if (!snsClient) snsClient = new SNSClient(clientOptions);
    return snsClient;
  },
  get sqsClient() {
    if (!sqsClient) sqsClient = new SQSClient(clientOptions);
    return sqsClient;
  },
  get eventBridgeClient() {
    if (!eventBridgeClient) eventBridgeClient = new EventBridgeClient(clientOptions);
    return eventBridgeClient;
  },
};
