const express = require('express');
const { authenticate, authorize } = require('@freshmart/service-shared').middleware;
const invoiceController = require('../controllers/vendor-invoice.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'FINANCE'), invoiceController.createInvoice);
router.get('/', authorize('ADMIN', 'FINANCE', 'STAFF'), invoiceController.listInvoices);
router.get('/:id', authorize('ADMIN', 'FINANCE', 'STAFF'), invoiceController.getInvoice);
router.put('/:id', authorize('ADMIN', 'FINANCE'), invoiceController.updateInvoice);
router.put('/:id/submit', authorize('ADMIN', 'FINANCE'), invoiceController.submitInvoice);
router.put('/:id/approve', authorize('ADMIN', 'FINANCE_MANAGER', 'FINANCE_HEAD'), invoiceController.approveInvoice);
router.put('/:id/reject', authorize('ADMIN', 'FINANCE_MANAGER', 'FINANCE_HEAD'), invoiceController.rejectInvoice);
router.put('/:id/cancel', authorize('ADMIN', 'FINANCE'), invoiceController.cancelInvoice);
router.post('/:id/payments', authorize('ADMIN', 'FINANCE'), invoiceController.recordPayment);

module.exports = router;
