const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('../../core/utils/logger');
const config = require('../../core/config');
const { genId } = require('../../core/utils/id');
const { awsOperationError, awsConfigurationError } = require('../aws/aws.errors');
const { logAwsRequest, logAwsFailure } = require('../aws/aws.logger');
const { EVENT_VERSION } = require('../../events/constants');
const { eventBridgeClient } = require('../aws/aws.client');

const hasEventBridgeConfig = () =>
  Boolean(config.aws.eventBridge.busName && config.aws.eventBridge.source);

const buildEventBridgeEntry = (event) => ({
  EventBusName: config.aws.eventBridge.busName,
  Source: config.aws.eventBridge.source,
  DetailType: event.eventType,
  Time: new Date(event.timestamp),
  Detail: JSON.stringify({
    eventId: event.eventId,
    correlationId: event.correlationId,
    requestId: event.requestId,
    timestamp: event.timestamp,
    version: event.version || EVENT_VERSION,
    payload: event.payload,
  }),
});

const publishEvent = async (event) => {
  if (!hasEventBridgeConfig()) {
    throw awsConfigurationError('EventBridge is not configured');
  }

  const entry = buildEventBridgeEntry(event);
  const start = Date.now();

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
        busName: config.aws.eventBridge.busName,
        source: config.aws.eventBridge.source,
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
        busName: config.aws.eventBridge.busName,
        source: config.aws.eventBridge.source,
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
    });
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
    source: context.source || config.aws.eventBridge.source || 'canteen-backend',
    version: context.version || EVENT_VERSION,
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
