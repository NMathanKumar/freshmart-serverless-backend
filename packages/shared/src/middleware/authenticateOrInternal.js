const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireCurrentUser } = require('../auth/current-user');
const config = require('../config');

const authenticateOrInternal = asyncHandler(async (req, res, next) => {
  const internalToken = String(req.headers['x-internal-service-token'] || '');
  if (config.aws.internalServiceToken && internalToken === config.aws.internalServiceToken) {
    req.user = {
      userId: 'service',
      role: 'SERVICE',
      email: 'service@freshmart.internal',
      internal: true,
    };
    return next();
  }

  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  req.user = requireCurrentUser(req);
  next();
});

module.exports = authenticateOrInternal;
