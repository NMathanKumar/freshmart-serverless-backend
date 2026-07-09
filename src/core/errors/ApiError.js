/**
 * Base class for all operational errors thrown intentionally by services/
 * controllers (as opposed to programming bugs). The global error handler
 * inspects `isOperational` to decide whether to leak the message to the
 * client or hide it behind a generic 500.
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors; // optional array of field-level validation errors
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad request', errors = null) {
    super(400, message, 'BAD_REQUEST', errors);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden — insufficient permissions') {
    super(403, message, 'FORBIDDEN');
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflict with current state') {
    super(409, message, 'CONFLICT');
  }
}

class ValidationError extends ApiError {
  constructor(errors, message = 'Validation failed') {
    super(422, message, 'VALIDATION_ERROR', errors);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR');
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
};
