const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../utils/logger');
const config = require('../config');
const { genId } = require('../utils/id');
const { awsOperationError, awsConfigurationError } = require('../errors/awsErrors');
const { logAwsRequest, logAwsFailure } = require('./logger');
const { EVENT_VERSION } = require('./constants');
const { eventBridgeClient } = require('../aws/clients');

const hasEventBridgeConfig = () => Boolean(config.aws.eventBusName && config.aws.eventSource);

const buildEventBridgeEntry = (event) => ({
  EventBusName: config.aws.eventBusName,
  Source: config.aws.eventSource,
  DetailType: event.eventType,
  Time: new Date(event.timestamp),
  Detail: JSON.stringify({
    eventId: event.eventId,
    correlationId: event.correlationId,
    requestId: event.requestId,
    timestamp: event.timestamp,
    version: event.version || EVENT_VERSION,
    data: event.data || event.payload,
    payload: event.payload || event.data,
  }),
});

const publishEvent = async (event) => {
  if (!hasEventBridgeConfig()) {
    throw awsConfigurationError('EventBridge is not configured');
  }

  const entry = buildEventBridgeEntry(event);
  const start = Date.now();
  const isRegisterPublish = event?.eventType === 'UserRegistered.v1';

  if (isRegisterPublish) {
    logger.debug('STEP 10A - EventBridge PutEvents start', {
      eventType: event.eventType,
      eventBusName: config.aws.eventBusName,
      eventSource: config.aws.eventSource,
      requestId: event.requestId,
      correlationId: event.correlationId,
    });
  }

  try {
    const response = await eventBridgeClient.send(new PutEventsCommand({ Entries: [entry] }));
    const latencyMs = Date.now() - start;
    const result = response?.Entries?.[0] || {};

    logAwsRequest({
      service: 'eventbridge',
      operation: 'PutEvents',
      requestId: response?.$metadata?.requestId,
      request: {
        eventId: event.eventId,
        eventType: event.eventType,
        busName: config.aws.eventBusName,
        source: config.aws.eventSource,
      },
      response: {
        status: result?.ErrorCode ? 'FAILED' : 'PUBLISHED',
        eventId: result?.EventId || null,
        errorCode: result?.ErrorCode || null,
        errorMessage: result?.ErrorMessage || null,
        latencyMs,
      },
    });

    logger.info('EventBridge publish status', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: result?.ErrorCode ? 'FAILED' : 'PUBLISHED',
      awsRequestId: response?.$metadata?.requestId || null,
      latencyMs,
    });

    if (isRegisterPublish) {
      logger.debug('STEP 10A - EventBridge PutEvents success', {
        eventType: event.eventType,
        awsRequestId: response?.$metadata?.requestId || null,
        entryEventId: result?.EventId || null,
        latencyMs,
      });
    }

    if (result?.ErrorCode) {
      throw new Error(`${result.ErrorCode}: ${result.ErrorMessage || 'EventBridge publish failed'}`);
    }

    return {
      eventId: result?.EventId || null,
      requestId: response?.$metadata?.requestId || null,
      latencyMs,
      publishStatus: 'PUBLISHED',
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    logAwsFailure({
      service: 'eventbridge',
      operation: 'PutEvents',
      requestId: error?.$metadata?.requestId,
      request: {
        eventId: event.eventId,
        eventType: event.eventType,
        busName: config.aws.eventBusName,
        source: config.aws.eventSource,
      },
      error,
    });
    logger.error('EventBridge publish status', {
      eventId: event.eventId,
      eventType: event.eventType,
      publishStatus: 'FAILED',
      awsRequestId: error?.$metadata?.requestId || null,
      latencyMs,
      failureReason: error.message,
      errorName: error?.name || null,
      errorCode: error?.code || null,
      stack: error?.stack || null,
    });
    if (isRegisterPublish) {
      logger.error('STEP 10A - EventBridge PutEvents failed', {
        eventType: event.eventType,
        eventBusName: config.aws.eventBusName,
        eventSource: config.aws.eventSource,
        errorName: error?.name || null,
        errorMessage: error?.message || null,
        errorCode: error?.code || null,
        stack: error?.stack || null,
      });
    }
    throw awsOperationError('Failed to publish event via EventBridge');
  }
};

const buildEventEnvelope = (eventType, payload = {}, context = {}) => {
  const requestId = context.requestId || null;
  const correlationId = context.correlationId || requestId || genId('COR');

  return {
    eventId: genId('EVT'),
    eventType,
    timestamp: new Date().toISOString(),
    source: context.source || config.aws.eventSource || 'canteen-backend',
    version: context.version || EVENT_VERSION,
    data: payload,
    payload,
    correlationId,
    requestId,
  };
};

module.exports = {
  hasEventBridgeConfig,
  publishEvent,
  buildEventEnvelope,
};
