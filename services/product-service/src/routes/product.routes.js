const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/shared').middleware;
const {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  availabilitySchema,
  listQuerySchema,
  searchQuerySchema,
} = require('../validators/product.validator');
const controller = require('../controllers/product.controller');

const router = express.Router();

router.get('/search', authenticate, validate(searchQuerySchema, 'query'), controller.searchProducts);
router.get('/', authenticate, validate(listQuerySchema, 'query'), controller.listProducts);
router.get('/:id', authenticate, validate(idParamSchema, 'params'), controller.getProductById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createProductSchema), controller.createProduct);
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  controller.updateProduct
);
router.patch(
  '/:id/availability',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(availabilitySchema),
  controller.setAvailability
);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(idParamSchema, 'params'), controller.deleteProduct);

module.exports = router;
