const express = require('express');
const { authenticate, authenticateOrInternal, authorize, validate } = require('@freshmart/service-shared').middleware;

const inventoryController = require('../controllers/inventory.controller');
const {
  idParamSchema,
  movementIdParamSchema,
  listQuerySchema,
  movementListQuerySchema,
  createInventorySchema,
  updateInventorySchema,
  increaseSchema,
  decreaseSchema,
  adjustmentSchema,
  approveRejectSchema,
} = require('../validators/inventory.validator');

const router = express.Router();

router.use('/transfers', require('./transfer.routes'));
router.use('/reservations', require('./reservation.routes'));

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
  '/forecast',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  inventoryController.getForecasts
);

router.get(
  '/forecast/:productId',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(idParamSchema, 'params'),
  inventoryController.getForecastByProductId
);

router.get(
  '/replenishment',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  inventoryController.getReplenishmentSuggestions
);

router.post(
  '/jobs/run-replenishment',
  authenticateOrInternal,
  authorize('ADMIN', 'SYSTEM'),
  inventoryController.runReplenishmentJob
);

router.get(
  '/movements',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(movementListQuerySchema, 'query'),
  inventoryController.listMovements
);

router.get(
  '/:productId/movements',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(movementListQuerySchema, 'query'),
  inventoryController.listMovements
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
  authenticateOrInternal,
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

router.post(
  '/:productId/adjustment',
  authenticateOrInternal,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(adjustmentSchema),
  inventoryController.adjustStock
);

router.post(
  '/:productId/damage',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(adjustmentSchema),
  inventoryController.adjustDamage
);

router.post(
  '/:productId/expired',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(adjustmentSchema),
  inventoryController.adjustExpired
);

router.post(
  '/:productId/return',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(adjustmentSchema),
  inventoryController.adjustReturn
);

router.post(
  '/:productId/cycle-count',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(adjustmentSchema),
  inventoryController.adjustCycleCount
);

router.patch(
  '/:productId/movements/:movementId/approve',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(movementIdParamSchema, 'params'),
  validate(approveRejectSchema),
  inventoryController.approveAdjustment
);

router.patch(
  '/:productId/movements/:movementId/reject',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate(movementIdParamSchema, 'params'),
  validate(approveRejectSchema),
  inventoryController.rejectAdjustment
);

module.exports = router;
