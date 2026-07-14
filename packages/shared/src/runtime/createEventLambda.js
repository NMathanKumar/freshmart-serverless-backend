const createEventLambda = (consumerName, dispatchEvent) => {
  if (typeof consumerName !== 'string' || !consumerName.trim()) {
    throw new TypeError('createEventLambda requires a consumer name');
  }
  if (typeof dispatchEvent !== 'function') {
    throw new TypeError('createEventLambda requires a dispatchEvent function');
  }

  return async (event = {}, context = {}) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const response = await dispatchEvent(event, context);
    return {
      ...response,
      consumerName,
    };
  };
};

module.exports = createEventLambda;
