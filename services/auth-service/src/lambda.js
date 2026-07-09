const createLambdaHandler = require('@freshmart/service-shared').createLambdaHandler;
const app = require('./app');

module.exports.handler = createLambdaHandler(app);
