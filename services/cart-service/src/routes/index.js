const express = require('express');
const authenticate = require('@freshmart/shared').middleware.authenticate;
const validate = require('@freshmart/shared').middleware.validate;
const {
  addItemSchema,
  updateQuantitySchema,
  productIdParamSchema,
} = require('../validators/cart.validator');

const controller = require('../controllers/cart.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getCart);
router.post('/items', validate(addItemSchema), controller.addItem);
router.patch(
  '/items/:productId',
  validate(productIdParamSchema, 'params'),
  validate(updateQuantitySchema),
  controller.updateItemQuantity
);
router.delete('/items/:productId', validate(productIdParamSchema, 'params'), controller.removeItem);
router.delete('/', controller.clearCart);

module.exports = router;
