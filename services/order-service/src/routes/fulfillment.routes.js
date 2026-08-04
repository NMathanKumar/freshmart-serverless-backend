const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/service-shared').middleware;
const Joi = require('joi');
const fulfillmentController = require('../controllers/fulfillment.controller');

const router = express.Router();

const createFulfillmentSchema = Joi.object({
  orderId: Joi.string().required(),
  warehouseId: Joi.string().required(),
  priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').default('NORMAL'),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(
    'NEW', 'ALLOCATED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 
    'QUALITY_CHECK', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 
    'FAILED', 'CANCELLED', 'RETURNED'
  ).required(),
});

const listQuerySchema = Joi.object({
  warehouseId: Joi.string().required(),
  status: Joi.string().optional(),
});

const idParamSchema = Joi.object({
  fulfillmentId: Joi.string().required(),
});

router.use(authenticate, authorize('ADMIN', 'STAFF'));

router.post(
  '/',
  validate(createFulfillmentSchema),
  fulfillmentController.createFulfillment
);

router.get(
  '/',
  validate(listQuerySchema, 'query'),
  fulfillmentController.listFulfillments
);

router.get(
  '/:fulfillmentId',
  validate(idParamSchema, 'params'),
  fulfillmentController.getFulfillment
);

router.put(
  '/:fulfillmentId/allocate',
  validate(idParamSchema, 'params'),
  fulfillmentController.allocateOrder
);

router.patch(
  '/:fulfillmentId/status',
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  fulfillmentController.updateFulfillmentStatus
);

module.exports = router;
