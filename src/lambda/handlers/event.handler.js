const { dispatchEvent } = require('../runtime/dispatcher');

module.exports.handler = async (event = {}, context = {}) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return dispatchEvent(event, context);
};
