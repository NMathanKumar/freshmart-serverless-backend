const { createLambdaHandler, createEventLambda } = require('@freshmart/service-shared');
const app = require('./app');
const { dispatchEvent } = require('./runtime');

const httpHandler = createLambdaHandler(app);
const eventHandler = createEventLambda('analytics-service', dispatchEvent);

module.exports.handler = async (event, context) => {
  if (event?.requestContext || event?.rawPath || event?.httpMethod || event?.path) {
    return httpHandler(event, context);
  }
  return eventHandler(event, context);
};
