const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');
const adminOrderRoutes = require('./routes/admin-order.routes');
const fulfillmentRoutes = require('./routes/fulfillment.routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/admin/orders', adminOrderRoutes);
    app.use('/v1/admin/orders', adminOrderRoutes);
    app.use('/orders/fulfillments', fulfillmentRoutes);
    app.use('/v1/orders/fulfillments', fulfillmentRoutes);
    app.use('/orders', routes);
    app.use('/v1/orders', routes);
  },
});
