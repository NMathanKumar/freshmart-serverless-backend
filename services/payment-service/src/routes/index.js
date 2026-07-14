const express = require('express');
const authenticate = require('@freshmart/service-shared').middleware.authenticate;
const authorize = require('@freshmart/service-shared').middleware.authorize;
const validate = require('@freshmart/service-shared').middleware.validate;
const controller = require('../controllers/payment.controller');
const {
  createPaymentSchema,
  confirmPaymentSchema,
  failPaymentSchema,
  refundPaymentSchema,
  refundPaymentByBodySchema,
  idParamSchema,
  orderIdParamSchema,
} = require('../validators/payment.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createPaymentSchema), controller.createPayment);
router.post('/refund', authorize('ADMIN', 'STAFF'), validate(refundPaymentByBodySchema), controller.refundPaymentByBody);
router.get('/order/:orderId', validate(orderIdParamSchema, 'params'), controller.getStatusByOrderId);
router.get('/:id', validate(idParamSchema, 'params'), controller.getPaymentById);
router.patch(
  '/:id/confirm',
  validate(idParamSchema, 'params'),
  validate(confirmPaymentSchema),
  controller.confirmPayment
);
router.patch('/:id/fail', validate(idParamSchema, 'params'), validate(failPaymentSchema), controller.failPayment);
router.patch(
  '/:id/refund',
  authorize('ADMIN', 'STAFF'),
  validate(idParamSchema, 'params'),
  validate(refundPaymentSchema),
  controller.refundPayment
);

module.exports = router;
