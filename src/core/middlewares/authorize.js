const { ForbiddenError } = require('../errors/ApiError');

/**
 * Role-based access control.
 * Usage: router.post('/menu', authenticate, authorize('ADMIN'), controller.create)
 *
 * Roles in this system: CUSTOMER, ADMIN, STAFF (canteen staff who update
 * order status / prep). Extend this array as the business grows.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ForbiddenError(
      `Role '${req.user?.role || 'unknown'}' is not permitted to perform this action`
    );
  }
  next();
};

module.exports = authorize;
