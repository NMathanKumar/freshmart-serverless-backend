/**
 * Wraps an async controller/middleware function so any rejected promise
 * is forwarded to next(err) automatically, instead of every controller
 * needing its own try/catch. Keeps controllers thin.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
