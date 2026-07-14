const { UnauthorizedError } = require('../errors/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyCognitoJwt, extractCognitoUser } = require('../auth/cognito');

const authenticate = asyncHandler(async (req, res, next) => {
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
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
});

module.exports = authenticate;
