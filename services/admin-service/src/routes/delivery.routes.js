const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/delivery.controller');
const {
  deliveryIdSchema,
  deliveryListSchema,
  deliveryStatusSchema,
  assignDriverSchema,
  cancelDeliverySchema,
} = require('../validators/delivery.validator');

const router = express.Router();
router.use(middleware.authenticate);
router.use(middleware.authorize('ADMIN'));

router.get('/', middleware.validate(deliveryListSchema, 'query'), controller.list);
router.get('/statistics', controller.getStatistics);
router.get('/:deliveryId', middleware.validate(deliveryIdSchema, 'params'), controller.getById);
router.patch('/:deliveryId/status', middleware.validate(deliveryIdSchema, 'params'), middleware.validate(deliveryStatusSchema), controller.updateStatus);
router.patch('/:deliveryId/assign-driver', middleware.validate(deliveryIdSchema, 'params'), middleware.validate(assignDriverSchema), controller.assignDriver);
router.patch('/:deliveryId/cancel', middleware.validate(deliveryIdSchema, 'params'), middleware.validate(cancelDeliverySchema), controller.cancel);

module.exports = router;
