const createEventLambda = require('@freshmart/service-shared').createEventLambda;
const { routeEvent } = require('./event-router/router');
const { dispatchEvent: legacyDispatchEvent } = require('./runtime');

const dispatchEvent = async (event = {}, context = {}) => {
  const detailType = event['detail-type'] || event.detailType || event.eventType;
  try {
    return await routeEvent(event, context);
  } catch (error) {
    if (error.message && error.message.includes('No notification handler registered')) {
      return legacyDispatchEvent(event, context);
    }
    throw error;
  }
};

module.exports = {
  handler: createEventLambda('notification-service', dispatchEvent),
  dispatchEvent,
};
