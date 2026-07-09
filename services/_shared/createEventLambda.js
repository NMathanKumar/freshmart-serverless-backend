const createEventLambda = (consumerName, dispatchEvent) => {
  if (typeof dispatchEvent !== 'function') {
    throw new Error('createEventLambda requires a dispatchEvent function');
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
