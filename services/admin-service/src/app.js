const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/admin', routes);
    app.use('/v1/admin', routes);
  },
});
