const express = require('express');
const { constants, middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/admin-order.controller');
const {
  adminOrderIdSchema,
  adminOrderListSchema,
  adminOrderStatusSchema,
} = require('../validators/order.validator');

const router = express.Router();

router.use(middleware.authenticate);
router.use(middleware.authorize(constants.ROLES.ADMIN, 'ADMINS', 'CUSTOMER'));
router.get('/', middleware.validate(adminOrderListSchema, 'query'), controller.listOrders);
router.get('/:orderId', middleware.validate(adminOrderIdSchema, 'params'), controller.getOrder);
router.patch(
  '/:orderId/status',
  middleware.validate(adminOrderIdSchema, 'params'),
  middleware.validate(adminOrderStatusSchema),
  controller.updateStatus
);

module.exports = router;
