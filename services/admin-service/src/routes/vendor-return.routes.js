const express = require('express');
const { authenticate, authorize } = require('@freshmart/service-shared').middleware;
const returnController = require('../controllers/vendor-return.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'FINANCE'), returnController.createReturn);
router.get('/', authorize('ADMIN', 'FINANCE', 'STAFF'), returnController.listReturns);
router.get('/:id', authorize('ADMIN', 'FINANCE', 'STAFF'), returnController.getReturn);
router.put('/:id', authorize('ADMIN', 'FINANCE'), returnController.updateReturn);
router.put('/:id/submit', authorize('ADMIN', 'FINANCE'), returnController.submitReturn);
router.put('/:id/approve', authorize('ADMIN', 'FINANCE_MANAGER', 'FINANCE_HEAD'), returnController.approveReturn);
router.put('/:id/reject', authorize('ADMIN', 'FINANCE_MANAGER', 'FINANCE_HEAD'), returnController.rejectReturn);
router.put('/:id/dispatch', authorize('ADMIN', 'FINANCE', 'STAFF'), returnController.dispatchReturn);
router.put('/:id/vendor-received', authorize('ADMIN', 'FINANCE', 'STAFF'), returnController.vendorReceived);
router.put('/:id/credit-note', authorize('ADMIN', 'FINANCE'), returnController.recordCreditNote);
router.put('/:id/close', authorize('ADMIN', 'FINANCE'), returnController.closeReturn);
router.put('/:id/cancel', authorize('ADMIN', 'FINANCE'), returnController.cancelReturn);

module.exports = router;
