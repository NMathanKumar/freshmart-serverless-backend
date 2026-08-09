module.exports = {
  authenticate: require('./authenticate'),
  authenticateOrInternal: require('./authenticateOrInternal'),
  authorize: require('./authorize'),
  validate: require('./validate'),
  requestLogger: require('./requestLogger'),
  errorHandler: require('./errorHandler').errorHandler,
  notFoundHandler: require('./errorHandler').notFoundHandler,
};
