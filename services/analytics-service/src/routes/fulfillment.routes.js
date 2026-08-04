const express = require('express');
const { authorize, validate } = require('@freshmart/service-shared').middleware;
const fulfillmentController = require('../controllers/fulfillment.controller');
const { fulfillmentAnalyticsQuerySchema } = require('../validators/fulfillment.validator');

const router = express.Router();

router.use(authorize('ADMIN', 'MANAGER'));

router.get(
  '/',
  validate(fulfillmentAnalyticsQuerySchema, 'query'),
  fulfillmentController.getFulfillmentAnalytics
);

module.exports = router;
