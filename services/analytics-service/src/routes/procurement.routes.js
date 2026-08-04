const express = require('express');
const { authorize, validate } = require('@freshmart/service-shared').middleware;
const procurementController = require('../controllers/procurement.controller');
const { procurementAnalyticsQuerySchema } = require('../validators/procurement.validator');

const router = express.Router();

router.use(authorize('ADMIN', 'FINANCE', 'MANAGER'));

router.get(
  '/',
  validate(procurementAnalyticsQuerySchema, 'query'),
  procurementController.getProcurementAnalytics
);

module.exports = router;
