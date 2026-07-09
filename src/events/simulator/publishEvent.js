const logger = require('../../core/utils/logger');
const { dispatchEvent } = require('../../lambda/runtime/dispatcher');
const { sampleEvents } = require('./sampleEvents');

const publishEvent = async (event, context = {}) => dispatchEvent(event, context);

const publishSampleEvents = async (events = sampleEvents, context = {}) => {
  const results = [];
  for (const event of events) {
    // Sequential execution keeps the local simulator deterministic and
    // mirrors how a single Lambda invocation handles one EventBridge event.
    // Retry/idempotency behavior is still exercised by the dispatcher.
    // eslint-disable-next-line no-await-in-loop
    results.push(await publishEvent(event, context));
  }
  return results;
};

if (require.main === module) {
  publishSampleEvents()
    .then((results) => {
      logger.info('Event simulator completed', { count: results.length });
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      logger.error('Event simulator failed', { error: error.message });
      process.exitCode = 1;
    });
}

module.exports = {
  publishEvent,
  publishSampleEvents,
};
