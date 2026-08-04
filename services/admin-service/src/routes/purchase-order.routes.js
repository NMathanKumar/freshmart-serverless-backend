const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const { authenticateOrInternal, authorize, validate } = middleware;
const controller = require('../controllers/purchase-order.controller');
const {
  purchaseOrderIdSchema,
  purchaseOrderListSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receivePurchaseOrderSchema,
  approvePurchaseOrderSchema,
  rejectPurchaseOrderSchema,
  autoGenerateSchema,
} = require('../validators/purchase-order.validator');
const Joi = require('joi');

const cancelSchema = Joi.object({
  reason: Joi.string().max(300).allow('', null).optional(),
});

const router = express.Router();
router.use(authenticateOrInternal);
router.use(authorize('ADMIN'));

router.get('/', middleware.validate(purchaseOrderListSchema, 'query'), controller.list);
router.get('/:purchaseOrderId', middleware.validate(purchaseOrderIdSchema, 'params'), controller.getById);
router.post('/auto-generate', middleware.validate(autoGenerateSchema), controller.autoGeneratePurchaseOrders);
router.post('/', middleware.validate(createPurchaseOrderSchema), controller.create);
router.put('/:purchaseOrderId', middleware.validate(purchaseOrderIdSchema, 'params'), middleware.validate(updatePurchaseOrderSchema), controller.update);
router.patch('/:purchaseOrderId/submit', middleware.validate(purchaseOrderIdSchema, 'params'), controller.submit);
router.patch('/:purchaseOrderId/approve', middleware.validate(purchaseOrderIdSchema, 'params'), middleware.validate(approvePurchaseOrderSchema), controller.approve);
router.patch('/:purchaseOrderId/reject', middleware.validate(purchaseOrderIdSchema, 'params'), middleware.validate(rejectPurchaseOrderSchema), controller.reject);
router.patch('/:purchaseOrderId/order', middleware.validate(purchaseOrderIdSchema, 'params'), controller.order);
router.patch('/:purchaseOrderId/receive', middleware.validate(purchaseOrderIdSchema, 'params'), middleware.validate(receivePurchaseOrderSchema), controller.receive);
router.patch('/:purchaseOrderId/cancel', middleware.validate(purchaseOrderIdSchema, 'params'), middleware.validate(cancelSchema), controller.cancel);

module.exports = router;
