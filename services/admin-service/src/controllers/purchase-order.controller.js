const { utils, response } = require('@freshmart/service-shared');
const purchaseOrderService = require('../services/purchase-order.service');

const list = utils.asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.list(req.query);
  response.success(res, { message: 'Purchase orders fetched', data: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

const getById = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.getById(req.params.purchaseOrderId);
  response.success(res, { message: 'Purchase order fetched', data: item });
});

const create = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.create(req.body, req.user?.userId || 'admin');
  response.created(res, { message: 'Purchase order created', data: item });
});

const update = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.update(req.params.purchaseOrderId, req.body);
  response.success(res, { message: 'Purchase order updated', data: item });
});

const receive = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.receive(req.params.purchaseOrderId, req.body, req.user?.userId || 'admin');
  response.success(res, { message: 'Purchase order received and inventory updated', data: item });
});

const submit = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.updateStatus(req.params.purchaseOrderId, 'SUBMITTED', req.user?.userId || 'admin');
  response.success(res, { message: 'Purchase order submitted', data: item });
});

const approve = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.updateStatus(req.params.purchaseOrderId, 'APPROVED', req.user?.userId || 'admin', req.body);
  response.success(res, { message: 'Purchase order approved', data: item });
});

const reject = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.updateStatus(req.params.purchaseOrderId, 'REJECTED', req.user?.userId || 'admin', req.body);
  response.success(res, { message: 'Purchase order rejected', data: item });
});

const order = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.updateStatus(req.params.purchaseOrderId, 'ORDERED', req.user?.userId || 'admin');
  response.success(res, { message: 'Purchase order placed', data: item });
});

const cancel = utils.asyncHandler(async (req, res) => {
  const item = await purchaseOrderService.cancel(req.params.purchaseOrderId, req.body, req.user?.userId || 'admin');
  response.success(res, { message: 'Purchase order cancelled', data: item });
});

const autoGeneratePurchaseOrders = utils.asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.autoGeneratePurchaseOrders(req.body.items, { user: req.user?.userId || 'SYSTEM' });
  response.created(res, { message: 'Purchase orders auto-generated successfully', data: result });
});

module.exports = { list, getById, create, update, receive, submit, approve, reject, cancel, order, autoGeneratePurchaseOrders };
