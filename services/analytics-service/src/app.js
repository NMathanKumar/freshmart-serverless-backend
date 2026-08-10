const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes/index.js');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/analytics', routes);
    app.use('/v1/analytics', routes);
    app.use('/admin/analytics', routes);
    app.use('/v1/admin/analytics', routes);
  },
});
