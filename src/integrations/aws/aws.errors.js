const { BadRequestError, InternalServerError } = require('../../core/errors/ApiError');

const awsConfigurationError = (message) => new BadRequestError(message);

const awsOperationError = (message) => new InternalServerError(message);

module.exports = {
  awsConfigurationError,
  awsOperationError,
};
