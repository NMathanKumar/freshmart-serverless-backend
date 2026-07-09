const express = require('express');
const authenticate = require('@freshmart/shared').middleware.authenticate;
const authorize = require('@freshmart/shared').middleware.authorize;
const validate = require('@freshmart/shared').middleware.validate;
const {
  placeOrderSchema,
  updateStatusSchema,
  idParamSchema,
  listQuerySchema,
} = require('../validators/order.validator');
const controller = require('../controllers/order.controller');

const router = express.Router();

router.use(authenticate);

router.get('/admin/all', authorize('ADMIN', 'STAFF'), validate(listQuerySchema, 'query'), controller.getAllOrdersAdmin);
router.post('/', validate(placeOrderSchema), controller.placeOrder);
router.get('/', validate(listQuerySchema, 'query'), controller.getUserOrders);
router.get('/:id', validate(idParamSchema, 'params'), controller.getOrderById);
router.get('/:id/track', validate(idParamSchema, 'params'), controller.trackOrder);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), validate(idParamSchema, 'params'), validate(updateStatusSchema), controller.updateOrderStatus);
router.put('/:id/cancel', validate(idParamSchema, 'params'), controller.cancelOrder);

module.exports = router;
