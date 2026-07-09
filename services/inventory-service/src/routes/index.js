const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/shared').middleware;

const inventoryController = require('../controllers/inventory.controller');
const {
  idParamSchema,
  listQuerySchema,
  createInventorySchema,
  updateInventorySchema,
  increaseSchema,
  decreaseSchema,
} = require('../validators/inventory.validator');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(listQuerySchema, 'query'),
  inventoryController.listInventory
);

router.get(
  '/alerts/low-stock',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  inventoryController.lowStockAlerts
);

router.get(
  '/:productId',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  inventoryController.getInventoryByProductId
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(createInventorySchema),
  inventoryController.createInventory
);

router.put(
  '/:productId',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(updateInventorySchema),
  inventoryController.updateInventory
);

router.patch(
  '/:productId/increase',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(increaseSchema),
  inventoryController.increase
);

router.patch(
  '/:productId/decrease',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(decreaseSchema),
  inventoryController.decrease
);

module.exports = router;
