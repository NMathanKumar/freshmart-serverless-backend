const express = require('express');
const { constants, middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/admin-customer.controller');
const {
  adminCustomerIdSchema,
  adminCustomerListSchema,
  adminCustomerStatusSchema,
} = require('../validators/user.validator');

const router = express.Router();

router.use(middleware.authenticate);
router.use(middleware.authorize(constants.ROLES.ADMIN));
router.get('/', middleware.validate(adminCustomerListSchema, 'query'), controller.listCustomers);
router.post('/', controller.createCustomer);
router.get('/:customerId', middleware.validate(adminCustomerIdSchema, 'params'), controller.getCustomer);
router.put('/:customerId', middleware.validate(adminCustomerIdSchema, 'params'), controller.updateCustomer);
router.patch(
  '/:customerId/status',
  middleware.validate(adminCustomerIdSchema, 'params'),
  middleware.validate(adminCustomerStatusSchema),
  controller.updateStatus
);

module.exports = router;
