const express = require('express');
const { authenticateOrInternal, authorize, validate } = require('@freshmart/service-shared').middleware;
const {
  createFoodSchema,
  updateFoodSchema,
  idParamSchema,
  availabilitySchema,
  listQuerySchema,
  searchQuerySchema,
} = require('../validator/menu.validator');
const controller = require('../controller/menu.controller');

const router = express.Router();

router.get('/search', authenticateOrInternal, validate(searchQuerySchema, 'query'), controller.searchFood);
router.get('/', authenticateOrInternal, validate(listQuerySchema, 'query'), controller.listFood);
router.get('/:id', authenticateOrInternal, validate(idParamSchema, 'params'), controller.getFoodById);
router.post(
  '/',
  authenticateOrInternal,
  authorize('ADMIN', 'STAFF'),
  validate(createFoodSchema),
  controller.createFood
);
router.patch(
  '/:id',
  authenticateOrInternal,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(updateFoodSchema),
  controller.updateFood
);
router.patch(
  '/:id/availability',
  authenticateOrInternal,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(availabilitySchema),
  controller.setAvailability
);
router.delete(
  '/:id',
  authenticateOrInternal,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  controller.deleteFood
);

module.exports = router;
