const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/v1/orders', routes);
  },
});
