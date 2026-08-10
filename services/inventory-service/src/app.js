const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes/index.js');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/inventory', routes);
    app.use('/v1/inventory', routes);
    app.use('/', routes);
  },
});
