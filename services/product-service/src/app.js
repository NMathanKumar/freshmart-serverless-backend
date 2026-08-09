const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/', routes);
    app.use('/products', routes);
    app.use('/v1/products', routes);
  },
});
