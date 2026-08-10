const express = require('express');
const authenticate = require('@freshmart/service-shared').middleware.authenticate;
const authorize = require('@freshmart/service-shared').middleware.authorize;
const validate = require('@freshmart/service-shared').middleware.validate;
const controller = require('../controllers/analytics.controller');
const {
  reportParamsSchema,
  dateParamsSchema,
  metricParamsSchema,
} = require('../validators/analytics.validator');

const router = express.Router();

router.use(authenticate);
router.use('/procurement', require('./procurement.routes'));
router.use('/fulfillment', require('./fulfillment.routes'));

const registerAnalyticsRoute = (path, handler) => {
  router.get(path, handler);
  router.get(`/analytics${path}`, handler);
  router.get(`/v1/analytics${path}`, handler);
  router.get(`/admin/analytics${path}`, handler);
  router.get(`/v1/admin/analytics${path}`, handler);
};

registerAnalyticsRoute('/dashboard', controller.getDashboardAnalytics);
registerAnalyticsRoute('/revenue', controller.getRevenueAnalytics);
registerAnalyticsRoute('/orders', controller.getOrderAnalytics);
registerAnalyticsRoute('/customers', controller.getCustomerAnalytics);
registerAnalyticsRoute('/products', controller.getProductAnalytics);
registerAnalyticsRoute('/categories', controller.getCategoryAnalytics);
registerAnalyticsRoute('/inventory', controller.getInventoryAnalytics);
registerAnalyticsRoute('/export', controller.exportAnalyticsReport);

router.get('/reports/date/:date', validate(dateParamsSchema, 'params'), controller.listReportsByDate);
router.get('/reports/:reportType/:date', validate(reportParamsSchema, 'params'), controller.getReportByTypeAndDate);
router.get('/metrics/:metricName', validate(metricParamsSchema, 'params'), controller.getMetricHistory);

module.exports = router;
