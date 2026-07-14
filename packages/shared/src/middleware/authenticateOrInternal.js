const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyCognitoJwt, extractCognitoUser } = require('../auth/cognito');
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

  try {
    const payload = await verifyCognitoJwt(token, { allowedTokenUse: ['access', 'id'] });
    const user = extractCognitoUser(payload);
    req.user = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      username: user.username,
      groups: user.groups,
      tokenUse: user.tokenUse,
      cognito: payload,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
});

module.exports = authenticateOrInternal;
