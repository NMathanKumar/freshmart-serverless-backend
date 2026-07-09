const logger = require('../../utils/logger');

const logAwsRequest = ({ service, operation, requestId, request, response }) => {
  logger.info('AWS request', {
    service,
    operation,
    requestId: requestId || null,
    request,
    response,
  });
};

const logAwsFailure = ({ service, operation, requestId, request, error }) => {
  logger.error('AWS request failed', {
    service,
    operation,
    requestId: requestId || null,
    request,
    failureReason: error.message,
    awsErrorName: error.name,
  });
};

module.exports = {
  logAwsRequest,
  logAwsFailure,
};
