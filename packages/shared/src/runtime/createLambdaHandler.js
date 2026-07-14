const serverless = require('serverless-http');

const createLambdaHandler = (app) => {
  if (typeof app !== 'function') {
    throw new TypeError('createLambdaHandler requires an Express application');
  }

  const adapters = new Map();

  return async (event = {}, context = {}) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const stage = event?.requestContext?.stage;
    const cacheKey = stage || '';
    if (!adapters.has(cacheKey)) {
      adapters.set(cacheKey, serverless(app, stage ? { basePath: `/${stage}` } : undefined));
    }

    return adapters.get(cacheKey)(event, context);
  };
};

module.exports = createLambdaHandler;
