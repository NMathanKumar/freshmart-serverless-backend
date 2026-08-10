const serverless = require('serverless-http');

const createLambdaHandler = (app) => {
  if (typeof app !== 'function') {
    throw new TypeError('createLambdaHandler requires an Express application');
  }

  const handler = serverless(app);

  return async (event = {}, context = {}) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return handler(event, context);
  };
};

module.exports = createLambdaHandler;
