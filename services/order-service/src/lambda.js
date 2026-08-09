const createLambdaHandler = require('@freshmart/service-shared').createLambdaHandler;
const app = require('./app');
const autoDeliver = require('./handlers/auto-deliver.handler');

const expressHandler = createLambdaHandler(app);

module.exports.handler = async (event = {}, context = {}) => {
  if (
    event.source === 'aws.events' ||
    event['detail-type'] ||
    event.resources ||
    event.source === 'auto-deliver' ||
    (!event.httpMethod && !event.requestContext?.http?.method)
  ) {
    return autoDeliver.handler(event, context);
  }
  return expressHandler(event, context);
};
