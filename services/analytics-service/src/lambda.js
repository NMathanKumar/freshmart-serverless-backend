const createEventLambda = require('@freshmart/service-shared').createEventLambda;
const { dispatchEvent } = require('./runtime');

module.exports.handler = createEventLambda('analytics-service', dispatchEvent);
