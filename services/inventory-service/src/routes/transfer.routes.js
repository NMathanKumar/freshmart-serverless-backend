const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const { authenticate, authorize } = middleware;
const transferController = require('../controllers/transfer.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', transferController.createTransfer);
router.get('/', transferController.listTransfers);
router.get('/:id', transferController.getTransfer);
router.put('/:id/submit', transferController.submitTransfer);
router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), transferController.approveTransfer);
router.put('/:id/reject', authorize('ADMIN', 'MANAGER'), transferController.rejectTransfer);
router.put('/:id/dispatch', transferController.dispatchTransfer);
router.put('/:id/receive', transferController.receiveTransfer);
router.put('/:id/cancel', transferController.cancelTransfer);

module.exports = router;
