const config = require('../config');
const { BadRequestError, InternalServerError, UnauthorizedError } = require('../errors/ApiError');

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const hasMenuServiceConfig = () => Boolean(normalizeBaseUrl(config.aws.menuServiceBaseUrl));

const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.aws.internalServiceToken) {
    headers['x-internal-service-token'] = config.aws.internalServiceToken;
  }

  return headers;
};

const request = async (path, { method, body, correlationId, requestId } = {}) => {
  if (!hasMenuServiceConfig()) {
    throw new BadRequestError('Menu service base URL is not configured');
  }

  const response = await fetch(`${normalizeBaseUrl(config.aws.menuServiceBaseUrl)}${path}`, {
    method,
    headers: {
      ...buildHeaders(),
      ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new InternalServerError(`Menu service returned invalid JSON for ${method || 'GET'} ${path}`);
    }
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error?.message || response.statusText;
    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedError(message);
    }
    throw new InternalServerError(message || 'Menu service request failed');
  }

  return payload?.data ?? payload;
};

const updateFood = (foodId, data, context = {}) =>
  request(`/v1/menu/${encodeURIComponent(foodId)}`, {
    method: 'PUT',
    body: data,
    correlationId: context.correlationId,
    requestId: context.requestId,
  });

const setAvailability = (foodId, available, context = {}) =>
  request(`/v1/menu/${encodeURIComponent(foodId)}/availability`, {
    method: 'PATCH',
    body: { available: !!available },
    correlationId: context.correlationId,
    requestId: context.requestId,
  });

module.exports = {
  hasMenuServiceConfig,
  updateFood,
  setAvailability,
};
