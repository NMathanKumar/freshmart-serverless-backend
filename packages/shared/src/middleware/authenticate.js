const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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
