const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/supplier.controller');
const {
  supplierIdSchema,
  supplierListSchema,
  createSupplierSchema,
  updateSupplierSchema,
} = require('../validators/supplier.validator');
const Joi = require('joi');

const supplierStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').required(),
});

const router = express.Router();
router.use(middleware.authenticate);
router.use(middleware.authorize('ADMIN'));

router.get('/', middleware.validate(supplierListSchema, 'query'), controller.list);
router.get('/:supplierId', middleware.validate(supplierIdSchema, 'params'), controller.getById);
router.post('/', middleware.validate(createSupplierSchema), controller.create);
router.put('/:supplierId', middleware.validate(supplierIdSchema, 'params'), middleware.validate(updateSupplierSchema), controller.update);
router.patch('/:supplierId/status', middleware.validate(supplierIdSchema, 'params'), middleware.validate(supplierStatusSchema), controller.updateStatus);
router.delete('/:supplierId', middleware.validate(supplierIdSchema, 'params'), controller.remove);

module.exports = router;
