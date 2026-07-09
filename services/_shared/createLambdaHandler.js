const serverless = require('serverless-http');

const createLambdaHandler = (app) => {
  return async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const stage = event?.requestContext?.stage;
    const handler = serverless(app, stage ? { basePath: `/${stage}` } : undefined);
    return handler(event, context);
  };
};

module.exports = createLambdaHandler;
