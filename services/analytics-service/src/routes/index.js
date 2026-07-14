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
router.use(authorize('ADMIN', 'STAFF'));

router.get('/reports/date/:date', validate(dateParamsSchema, 'params'), controller.listReportsByDate);
router.get('/reports/:reportType/:date', validate(reportParamsSchema, 'params'), controller.getReportByTypeAndDate);
router.get('/metrics/:metricName', validate(metricParamsSchema, 'params'), controller.getMetricHistory);

module.exports = router;
