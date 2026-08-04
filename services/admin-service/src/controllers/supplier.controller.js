const { utils, response } = require('@freshmart/service-shared');
const supplierService = require('../services/supplier.service');

const list = utils.asyncHandler(async (req, res) => {
  const result = await supplierService.list(req.query);
  response.success(res, { message: 'Suppliers fetched', data: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

const getById = utils.asyncHandler(async (req, res) => {
  const item = await supplierService.getById(req.params.supplierId);
  response.success(res, { message: 'Supplier fetched', data: item });
});

const create = utils.asyncHandler(async (req, res) => {
  const item = await supplierService.create(req.body, req.user?.userId || 'admin');
  response.created(res, { message: 'Supplier created', data: item });
});

const update = utils.asyncHandler(async (req, res) => {
  const item = await supplierService.update(req.params.supplierId, req.body);
  response.success(res, { message: 'Supplier updated', data: item });
});

const remove = utils.asyncHandler(async (req, res) => {
  await supplierService.remove(req.params.supplierId);
  response.success(res, { message: 'Supplier deleted', data: null });
});

const updateStatus = utils.asyncHandler(async (req, res) => {
  const item = await supplierService.updateStatus(req.params.supplierId, req.body.status);
  response.success(res, { message: `Supplier status updated to '${req.body.status}'`, data: item });
});

module.exports = { list, getById, create, update, remove, updateStatus };
