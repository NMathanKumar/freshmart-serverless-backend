const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const { EventBridgeClient } = require('@aws-sdk/client-eventbridge');
const { buildConfig } = require('../config');

const config = buildConfig();
const baseClientOptions = { region: config.aws.region };

let dynamoDbClient;
let documentClient;
let s3Client;
let snsClient;
let sqsClient;
let eventBridgeClient;

const getDynamoDbClient = () => {
  if (!dynamoDbClient) {
    dynamoDbClient = new DynamoDBClient(baseClientOptions);
  }
  return dynamoDbClient;
};

const getDocumentClient = () => {
  if (!documentClient) {
    documentClient = DynamoDBDocumentClient.from(getDynamoDbClient(), {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
        convertClassInstanceToMap: true,
      },
    });
  }
  return documentClient;
};

const getS3Client = () => {
  if (!s3Client) s3Client = new S3Client(baseClientOptions);
  return s3Client;
};

const getSnsClient = () => {
  if (!snsClient) snsClient = new SNSClient(baseClientOptions);
  return snsClient;
};

const getSqsClient = () => {
  if (!sqsClient) sqsClient = new SQSClient(baseClientOptions);
  return sqsClient;
};

const getEventBridgeClient = () => {
  if (!eventBridgeClient) eventBridgeClient = new EventBridgeClient(baseClientOptions);
  return eventBridgeClient;
};

module.exports = {
  config,
  get dynamoDbClient() {
    return getDynamoDbClient();
  },
  get documentClient() {
    return getDocumentClient();
  },
  get s3Client() {
    return getS3Client();
  },
  get snsClient() {
    return getSnsClient();
  },
  get sqsClient() {
    return getSqsClient();
  },
  get eventBridgeClient() {
    return getEventBridgeClient();
  },
};
