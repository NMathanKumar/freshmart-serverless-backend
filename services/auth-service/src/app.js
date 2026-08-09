const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const routes = require('./routes');

// Separate admin-only router so /admin/users resolves when API GW strips prefix
const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/service-shared').middleware;
const { adminCreateUserSchema } = require('./validator/auth.validator');
const controller = require('./controller/auth.controller');

const adminRouter = express.Router();
adminRouter.post('/users', authenticate, authorize('ADMIN'), validate(adminCreateUserSchema), controller.adminCreateUser);

module.exports = createServiceApp({
  mountRoutes(app) {
    app.use('/auth', routes);
    app.use('/v1/auth', routes);
    // Mount admin sub-routes for API GW path /admin/users → Lambda receives /admin/users
    app.use('/admin', adminRouter);
    app.use('/v1/admin', adminRouter);
  },
});

