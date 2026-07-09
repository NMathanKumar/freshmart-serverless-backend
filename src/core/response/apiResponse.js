/**
 * Standard response envelope used across ALL endpoints.
 * Keeping this identical everywhere is what makes the API predictable
 * for frontend/mobile integration and for Postman test scripting.
 *
 * Success shape:
 * { success: true, message, data, meta }
 *
 * Error shape (see ApiError + errorHandler middleware):
 * { success: false, message, errorCode, errors }
 */

const success = (res, { message = 'Success', data = null, meta = null, statusCode = 200 }) => {
  const body = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || null,
  };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const created = (res, { message = 'Created successfully', data = null }) =>
  success(res, { message, data, statusCode: 201 });

const noContent = (res, { message = 'Deleted successfully' }) =>
  success(res, { message, data: null, statusCode: 200 });

module.exports = { success, created, noContent };
