const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/service-shared').middleware;
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

router.get('/search', validate(searchQuerySchema, 'query'), controller.searchProducts);
router.get('/', validate(listQuerySchema, 'query'), controller.listProducts);
router.get('/:id', validate(idParamSchema, 'params'), controller.getProductById);
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), validate(createProductSchema), controller.createProduct);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  controller.updateProduct
);
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
router.post('/upload-url', controller.getUploadUrl);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(idParamSchema, 'params'), controller.deleteProduct);

module.exports = router;
