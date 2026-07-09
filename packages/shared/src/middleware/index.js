module.exports = {
  authenticate: require('./authenticate'),
  authorize: require('./authorize'),
  validate: require('./validate'),
  requestLogger: require('./requestLogger'),
  errorHandler: require('./errorHandler').errorHandler,
  notFoundHandler: require('./errorHandler').notFoundHandler,
};
