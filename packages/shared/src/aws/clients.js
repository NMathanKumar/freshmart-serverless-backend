const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const { buildConfig } = require('../config');

const config = buildConfig();
const baseClientOptions = { region: config.aws.region };

const dynamoDbClient = new DynamoDBClient(baseClientOptions);
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
    convertClassInstanceToMap: true,
  },
});

const s3Client = new S3Client(baseClientOptions);
const snsClient = new SNSClient(baseClientOptions);
const sqsClient = new SQSClient(baseClientOptions);
const eventBridgeClient = new EventBridgeClient(baseClientOptions);

module.exports = {
  config,
  dynamoDbClient,
  documentClient,
  s3Client,
  snsClient,
  sqsClient,
  eventBridgeClient,
};
