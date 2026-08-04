const invoiceService = require('../services/vendor-invoice.service');
const invoiceRepo = require('../repositories/vendor-invoice.repository');
const { 
  createVendorInvoiceSchema, 
  updateVendorInvoiceSchema,
  submitVendorInvoiceSchema, 
  approveVendorInvoiceSchema, 
  rejectVendorInvoiceSchema, 
  cancelVendorInvoiceSchema, 
  recordPaymentSchema 
} = require('../validators/vendor-invoice.validator');
const { errors, response } = require('@freshmart/service-shared');

const createInvoice = async (req, res, next) => {
  try {
    const { error, value } = createVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.createInvoice(value, { userId: req.user?.id });
    res.status(201).json(response.success(invoice, 201, 'Vendor Invoice created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { error, value } = updateVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.updateInvoice(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Vendor Invoice updated successfully'));
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceRepo.getInvoice(req.params.id);
    if (!invoice) throw new errors.NotFoundError('Vendor Invoice not found');
    res.json(response.success(invoice));
  } catch (error) {
    next(error);
  }
};

const listInvoices = async (req, res, next) => {
  try {
    const filters = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      supplierId: req.query.supplierId,
      purchaseOrderId: req.query.purchaseOrderId,
      status: req.query.status,
    };
    const result = await invoiceRepo.listInvoices(filters);
    res.json(response.success(result));
  } catch (error) {
    next(error);
  }
};

const submitInvoice = async (req, res, next) => {
  try {
    const { error, value } = submitVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.submitInvoice(req.params.id, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Vendor Invoice submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const approveInvoice = async (req, res, next) => {
  try {
    const { error, value } = approveVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.approveInvoice(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Vendor Invoice approved successfully'));
  } catch (error) {
    next(error);
  }
};

const rejectInvoice = async (req, res, next) => {
  try {
    const { error, value } = rejectVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.rejectInvoice(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Vendor Invoice rejected successfully'));
  } catch (error) {
    next(error);
  }
};

const cancelInvoice = async (req, res, next) => {
  try {
    const { error, value } = cancelVendorInvoiceSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.cancelInvoice(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Vendor Invoice cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { error, value } = recordPaymentSchema.validate(req.body);
    if (error) throw new errors.ValidationError(error.details[0].message);

    const invoice = await invoiceService.recordPayment(req.params.id, value, { userId: req.user?.id });
    res.json(response.success(invoice, 200, 'Payment recorded successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  getInvoice,
  listInvoices,
  submitInvoice,
  approveInvoice,
  rejectInvoice,
  cancelInvoice,
  recordPayment,
};
