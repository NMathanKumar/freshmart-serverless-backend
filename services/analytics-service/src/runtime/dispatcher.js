const logger = require('@freshmart/shared').logger;
const { normalizeEventBridgeEvent, getEventMetadata } = require('./utils');
const { getHandler } = require('./router');
const { runMiddlewareStack } = require('./middleware');

const dispatchEvent = async (event = {}, context = {}) => {
  const normalizedEvent = normalizeEventBridgeEvent(event);
  const metadata = getEventMetadata(event, normalizedEvent);
  const handler = getHandler(normalizedEvent.detailType);
  const runtimeContext = {
    ...metadata,
    consumer: handler.consumerName || handler.name || 'anonymousConsumer',
    awsContext: context,
    detailType: normalizedEvent.detailType,
  };

  logger.info('Dispatching EventBridge event', {
    eventId: metadata.eventId,
    eventType: metadata.eventType,
    correlationId: metadata.correlationId,
    requestId: metadata.requestId,
  });

  return runMiddlewareStack(handler, normalizedEvent, runtimeContext);
};

module.exports = {
  dispatchEvent,
};
