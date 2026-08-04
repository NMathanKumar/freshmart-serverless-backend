const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');
const adminCustomerRoutes = require('./routes/admin-customer.routes');

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/admin/customers', adminCustomerRoutes);
    app.use('/v1/admin/customers', adminCustomerRoutes);
    app.use('/users', routes);
    app.use('/v1/users', routes);
    app.use('/api/v1/customer', routes);
  },
});
