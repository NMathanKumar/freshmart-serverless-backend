const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes/index.js');
const adminCustomerRoutes = require('./routes/admin-customer.routes');
const controller = require('./controllers/user.controller');
const { authenticate } = require('@freshmart/service-shared').middleware;

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/admin/customers', adminCustomerRoutes);
    app.use('/v1/admin/customers', adminCustomerRoutes);

    // Mount /admin/profile and /admin/settings for Admin Web
    app.get('/admin/profile', authenticate, controller.getProfile);
    app.get('/v1/admin/profile', authenticate, controller.getProfile);
    app.put('/admin/profile', authenticate, controller.upsertProfile);
    app.put('/v1/admin/profile', authenticate, controller.upsertProfile);

    app.get('/admin/settings', authenticate, controller.getSettings);
    app.get('/v1/admin/settings', authenticate, controller.getSettings);
    app.put('/admin/settings', authenticate, controller.updateSettings);
    app.put('/v1/admin/settings', authenticate, controller.updateSettings);

    app.use('/users', routes);
    app.use('/v1/users', routes);
    app.use('/api/v1/customer', routes);
  },
});
