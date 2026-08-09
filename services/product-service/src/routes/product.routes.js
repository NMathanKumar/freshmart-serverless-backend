const express = require('express');
const controller = require('../controllers/product.controller');

const router = express.Router();

// 1. Upload URL subroutes
router.post('/upload-url', controller.getUploadUrl);
router.post('/v1/products/upload-url', controller.getUploadUrl);
router.post('/products/upload-url', controller.getUploadUrl);

// 2. Search subroutes
router.get('/search', controller.searchProducts);
router.get('/v1/products/search', controller.searchProducts);
router.get('/products/search', controller.searchProducts);

// 3. List & Create Product root endpoints
router.get('/', controller.listProducts);
router.get('/v1/products', controller.listProducts);
router.get('/products', controller.listProducts);

router.post('/', controller.createProduct);
router.post('/v1/products', controller.createProduct);
router.post('/products', controller.createProduct);

// 4. Dynamic Parameter ID routes with strict route reserved keyword guard
router.get('/:id', (req, res, next) => {
  const targetId = String(req.params.id || '').toLowerCase();
  if (['products', 'search', 'upload-url', 'v1'].includes(targetId)) {
    return controller.listProducts(req, res, next);
  }
  return controller.getProductById(req, res, next);
});

router.put('/:id', controller.updateProduct);
router.patch('/:id/availability', controller.setAvailability);
router.patch('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
