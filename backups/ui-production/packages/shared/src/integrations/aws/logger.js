const logger = require('../../utils/logger');

const logAwsRequest = ({ service, operation, requestId, request, response }) => {
  logger.info('AWS request', {
    service,
    operation,
    requestId: requestId || null,
    request,
    response,
    ...logger.captureMemory(),
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
    ...logger.captureMemory(),
  });
};

module.exports = {
  logAwsRequest,
  logAwsFailure,
};
