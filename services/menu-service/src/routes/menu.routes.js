const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/shared').middleware;
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

router.get('/search', authenticate, validate(searchQuerySchema, 'query'), controller.searchFood);
router.get('/', authenticate, validate(listQuerySchema, 'query'), controller.listFood);
router.get('/:id', authenticate, validate(idParamSchema, 'params'), controller.getFoodById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createFoodSchema), controller.createFood);
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(updateFoodSchema),
  controller.updateFood
);
router.patch(
  '/:id/availability',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(availabilitySchema),
  controller.setAvailability
);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(idParamSchema, 'params'), controller.deleteFood);

module.exports = router;