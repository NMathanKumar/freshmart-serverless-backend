const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireCurrentUser } = require('../auth/current-user');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  req.user = requireCurrentUser(req);
  next();
});

module.exports = authenticate;
