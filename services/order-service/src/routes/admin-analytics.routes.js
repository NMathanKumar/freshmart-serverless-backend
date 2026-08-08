const express = require('express');
const controller = require('../controllers/admin-order.controller');

const router = express.Router();

router.get('/dashboard', controller.getAnalyticsDashboard);
router.get('/revenue', controller.getAnalyticsDashboard);
router.get('/orders', controller.getAnalyticsDashboard);
router.get('/products', controller.getAnalyticsDashboard);
router.get('/customers', controller.getAnalyticsDashboard);
router.get('/categories', controller.getAnalyticsDashboard);
router.get('/inventory', controller.getAnalyticsDashboard);
router.get('/export', controller.exportAnalyticsReport);
router.get('/report', controller.exportAnalyticsReport);

module.exports = router;
