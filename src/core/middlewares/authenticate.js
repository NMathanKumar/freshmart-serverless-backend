const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the Bearer JWT on the Authorization header and attaches the
 * decoded payload to req.user as { userId, role, email }.
 * Stateless by design — no session lookup — so it works identically
 * whether the request is served by Express locally or by Lambda.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { userId: payload.userId, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
});

module.exports = authenticate;
