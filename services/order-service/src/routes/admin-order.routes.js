const express = require('express');
const { constants, middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/admin-order.controller');
const {
  adminOrderIdSchema,
  adminOrderListSchema,
  adminOrderStatusSchema,
} = require('../validators/order.validator');

const router = express.Router();

const authMw = middleware?.authenticate || ((req, res, next) => next());
const adminMw = middleware?.authorize ? middleware.authorize(constants?.ROLES?.ADMIN || 'ADMIN') : ((req, res, next) => next());
const validateMw = (schema, type) => (middleware?.validate ? middleware.validate(schema, type) : ((req, res, next) => next()));

router.use(authMw);
router.use(adminMw);
router.get('/', validateMw(adminOrderListSchema, 'query'), controller.listOrders);
router.get('/:orderId', validateMw(adminOrderIdSchema, 'params'), controller.getOrder);
router.patch(
  '/:orderId/status',
  validateMw(adminOrderIdSchema, 'params'),
  validateMw(adminOrderStatusSchema),
  controller.updateStatus
);
router.put(
  '/:orderId/status',
  validateMw(adminOrderIdSchema, 'params'),
  validateMw(adminOrderStatusSchema),
  controller.updateStatus
);
router.put(
  '/:orderId',
  validateMw(adminOrderIdSchema, 'params'),
  validateMw(adminOrderStatusSchema),
  controller.updateStatus
);

module.exports = router;
