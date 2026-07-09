const { ForbiddenError } = require('../errors/ApiError');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ForbiddenError(
      `Role '${req.user?.role || 'unknown'}' is not permitted to perform this action`
    );
  }
  next();
};

module.exports = authorize;
