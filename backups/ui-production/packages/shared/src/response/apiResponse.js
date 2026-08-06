const buildSuccessBody = (res, { message = 'Success', data = null, meta = null }) => {
  const body = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || null,
  };

  if (meta) {
    body.meta = meta;
  }

  return body;
};

const success = (res, { message = 'Success', data = null, meta = null, statusCode = 200 }) =>
  res.status(statusCode).json(buildSuccessBody(res, { message, data, meta }));

const created = (res, { message = 'Created successfully', data = null }) =>
  success(res, { message, data, statusCode: 201 });

const noContent = (res, { message = 'Deleted successfully' }) =>
  success(res, { message, data: null, statusCode: 200 });

module.exports = { success, created, noContent, buildSuccessBody };
