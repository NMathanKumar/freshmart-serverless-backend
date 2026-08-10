const { ForbiddenError } = require('../errors/ApiError');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (req.user?.internal) {
    return next();
  }

  const userRole = (req.user?.role || '').toUpperCase();
  const allowedUpper = allowedRoles.map((r) => String(r).toUpperCase());

  const isMatch = allowedUpper.some((allowed) => {
    if (allowed === userRole) return true;
    if (allowed === 'ADMIN' && (userRole === 'ADMINS' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) return true;
    if (allowed === 'ADMINS' && (userRole === 'ADMINS' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) return true;
    return false;
  });

  if (!req.user || !isMatch) {
    throw new ForbiddenError(
      `Role '${req.user?.role || 'unknown'}' is not permitted to perform this action`
    );
  }
  next();
};

module.exports = authorize;
