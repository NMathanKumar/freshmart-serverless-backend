const createServiceApp = require('@freshmart/service-shared').createServiceApp;
const getRouter = (r) => {
  if (!r) return r;
  if (typeof r === 'function') return r;
  if (r.routes && typeof r.routes === 'function') return r.routes;
  if (r.default) {
    if (typeof r.default === 'function') return r.default;
    if (r.default.routes && typeof r.default.routes === 'function') return r.default.routes;
    if (r.default.router && typeof r.default.router === 'function') return r.default.router;
  }
  if (r.router && typeof r.router === 'function') return r.router;
  return r;
};
const routes = getRouter(require('./routes/index.js'));
const adminOrderRoutes = getRouter(require('./routes/admin-order.routes.js'));
const adminAnalyticsRoutes = getRouter(require('./routes/admin-analytics.routes.js'));
const fulfillmentRoutes = getRouter(require('./routes/fulfillment.routes.js'));

module.exports = createServiceApp({
  mountRoutes(app) {
    const adminRouter = getRouter(adminOrderRoutes);
    const analyticsRouter = getRouter(adminAnalyticsRoutes);
    const fulfillRouter = getRouter(fulfillmentRoutes);
    const mainRouter = getRouter(routes);

    app.use('/admin/orders', adminRouter);
    app.use('/v1/admin/orders', adminRouter);
    app.use('/', analyticsRouter);
    app.use('/admin/analytics', analyticsRouter);
    app.use('/v1/admin/analytics', analyticsRouter);
    app.use('/orders/fulfillments', fulfillRouter);
    app.use('/v1/orders/fulfillments', fulfillRouter);
    app.use('/orders', mainRouter);
    app.use('/v1/orders', mainRouter);
  },
});
