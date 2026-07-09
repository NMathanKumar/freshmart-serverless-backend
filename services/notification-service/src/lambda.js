const createEventLambda = require('@freshmart/service-shared').createEventLambda;
const { dispatchEvent } = require('./runtime');

module.exports.handler = createEventLambda('notification-service', dispatchEvent);
