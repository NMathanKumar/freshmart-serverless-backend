const returnService = require('../services/vendor-return.service');
const returnRepo = require('../repositories/vendor-return.repository');
const { 
  createReturnSchema, 
  updateReturnSchema,
  submitReturnSchema, 
  approveReturnSchema, 
  rejectReturnSchema, 
  dispatchReturnSchema,
  vendorReceivedSchema,
  creditNoteSchema,
  cancelReturnSchema 
} = require('../validators/vendor-return.validator');
const { errors, response } = require('@freshmart/service-shared');

const createReturn = async (req, res, next) => {
  try {
    const { error, value } = createReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.createReturn(value, { userId: req.user?.id });
    res.status(201).json(response.success(rtv, 201, 'Vendor Return created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateReturn = async (req, res, next) => {
  try {
    const { error, value } = updateReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.updateReturn(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return updated successfully'));
  } catch (error) {
    next(error);
  }
};

const getReturn = async (req, res, next) => {
  try {
    const rtv = await returnRepo.getReturn(req.params.id);
    if (!rtv) throw new errors.NotFoundError('Vendor Return not found');
    res.json(response.success(rtv));
  } catch (error) {
    next(error);
  }
};

const listReturns = async (req, res, next) => {
  try {
    const filters = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      supplierId: req.query.supplierId,
      purchaseOrderId: req.query.purchaseOrderId,
      status: req.query.status,
    };
    const result = await returnRepo.listReturns(filters);
    res.json(response.success(result));
  } catch (error) {
    next(error);
  }
};

const submitReturn = async (req, res, next) => {
  try {
    const { error, value } = submitReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.submitReturn(req.params.id, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const approveReturn = async (req, res, next) => {
  try {
    const { error, value } = approveReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.approveReturn(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return approved successfully'));
  } catch (error) {
    next(error);
  }
};

const rejectReturn = async (req, res, next) => {
  try {
    const { error, value } = rejectReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.rejectReturn(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return rejected successfully'));
  } catch (error) {
    next(error);
  }
};

const dispatchReturn = async (req, res, next) => {
  try {
    const { error, value } = dispatchReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.dispatchReturn(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return dispatched successfully'));
  } catch (error) {
    next(error);
  }
};

const vendorReceived = async (req, res, next) => {
  try {
    const { error, value } = vendorReceivedSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.vendorReceived(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Receipt recorded successfully'));
  } catch (error) {
    next(error);
  }
};

const recordCreditNote = async (req, res, next) => {
  try {
    const { error, value } = creditNoteSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.recordCreditNote(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Credit Note recorded successfully'));
  } catch (error) {
    next(error);
  }
};

const closeReturn = async (req, res, next) => {
  try {
    const rtv = await returnService.closeReturn(req.params.id, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return closed successfully'));
  } catch (error) {
    next(error);
  }
};

const cancelReturn = async (req, res, next) => {
  try {
    const { error, value } = cancelReturnSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const rtv = await returnService.cancelReturn(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(rtv, 200, 'Vendor Return cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturn,
  updateReturn,
  getReturn,
  listReturns,
  submitReturn,
  approveReturn,
  rejectReturn,
  dispatchReturn,
  vendorReceived,
  recordCreditNote,
  closeReturn,
  cancelReturn,
};
