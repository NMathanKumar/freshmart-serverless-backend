const { randomUUID } = require('crypto');
const { buildConfig } = require('../config');

const VERSION = '1.0';

const buildEnvelope = (eventType, payload = {}, context = {}) => {
  const config = buildConfig();
  const timestamp = new Date().toISOString();

  return {
    eventId: context.eventId || randomUUID(),
    eventType,
    timestamp,
    source: context.source || config.aws.eventSource || config.serviceName,
    version: context.version || VERSION,
    correlationId: context.correlationId || context.requestId || randomUUID(),
    requestId: context.requestId || randomUUID(),
    data: payload,
    payload,
  };
};

module.exports = {
  VERSION,
  buildEnvelope,
};
