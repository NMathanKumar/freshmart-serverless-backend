const transferService = require('../services/transfer.service');
const transferRepo = require('../repositories/transfer.repository');
const { CreateTransferSchema, UpdateTransferSchema, SubmitTransferSchema, ApproveTransferSchema, RejectTransferSchema, CancelTransferSchema, DispatchTransferSchema, ReceiveTransferSchema } = require('../validators/transfer.validator');
const { errors, response } = require('@freshmart/service-shared');

const createTransfer = async (req, res, next) => {
  try {
    const payload = CreateTransferSchema.parse(req.body);
    const transfer = await transferService.createTransfer(payload, { userId: req.user?.id });
    res.status(201).json(response.success(transfer, 201, 'Transfer created successfully'));
  } catch (error) {
    next(error);
  }
};

const getTransfer = async (req, res, next) => {
  try {
    const transfer = await transferRepo.getTransfer(req.params.id);
    if (!transfer) throw new errors.NotFoundError('Transfer not found');
    res.json(response.success(transfer));
  } catch (error) {
    next(error);
  }
};

const listTransfers = async (req, res, next) => {
  try {
    const filters = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sourceWarehouseId: req.query.sourceWarehouseId,
      destinationWarehouseId: req.query.destinationWarehouseId,
      status: req.query.status,
    };
    const result = await transferRepo.listTransfers(filters);
    res.json(response.success(result));
  } catch (error) {
    next(error);
  }
};

const submitTransfer = async (req, res, next) => {
  try {
    const payload = SubmitTransferSchema.parse(req.body);
    const transfer = await transferService.submitTransfer(req.params.id, payload, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const approveTransfer = async (req, res, next) => {
  try {
    const payload = ApproveTransferSchema.parse(req.body);
    const transfer = await transferService.approveTransfer(req.params.id, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer approved successfully'));
  } catch (error) {
    next(error);
  }
};

const rejectTransfer = async (req, res, next) => {
  try {
    const payload = RejectTransferSchema.parse(req.body);
    const transfer = await transferService.rejectTransfer(req.params.id, payload, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer rejected successfully'));
  } catch (error) {
    next(error);
  }
};

const dispatchTransfer = async (req, res, next) => {
  try {
    const payload = DispatchTransferSchema.parse(req.body);
    const transfer = await transferService.dispatchTransfer(req.params.id, payload, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer dispatched successfully'));
  } catch (error) {
    next(error);
  }
};

const receiveTransfer = async (req, res, next) => {
  try {
    const payload = ReceiveTransferSchema.parse(req.body);
    const transfer = await transferService.receiveTransfer(req.params.id, payload, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer received successfully'));
  } catch (error) {
    next(error);
  }
};

const cancelTransfer = async (req, res, next) => {
  try {
    const payload = CancelTransferSchema.parse(req.body);
    const transfer = await transferService.cancelTransfer(req.params.id, payload, { userId: req.user?.id });
    res.json(response.success(transfer, 200, 'Transfer cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransfer,
  getTransfer,
  listTransfers,
  submitTransfer,
  approveTransfer,
  rejectTransfer,
  dispatchTransfer,
  receiveTransfer,
  cancelTransfer,
};
