const { utils, response } = require('@freshmart/service-shared');
const deliveryService = require('../services/delivery.service');

const list = utils.asyncHandler(async (req, res) => {
  const result = await deliveryService.list(req.query);
  response.success(res, { message: 'Deliveries fetched', data: result.items, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

const getById = utils.asyncHandler(async (req, res) => {
  const item = await deliveryService.getById(req.params.deliveryId);
  response.success(res, { message: 'Delivery fetched', data: item });
});

const updateStatus = utils.asyncHandler(async (req, res) => {
  const item = await deliveryService.updateStatus(req.params.deliveryId, req.body);
  response.success(res, { message: `Delivery status updated to '${req.body.status}'`, data: item });
});

const assignDriver = utils.asyncHandler(async (req, res) => {
  const item = await deliveryService.assignDriver(req.params.deliveryId, req.body);
  response.success(res, { message: 'Driver assigned', data: item });
});

const cancel = utils.asyncHandler(async (req, res) => {
  const item = await deliveryService.cancel(req.params.deliveryId, req.body);
  response.success(res, { message: 'Delivery cancelled', data: item });
});

const getStatistics = utils.asyncHandler(async (_req, res) => {
  const stats = await deliveryService.getStatistics();
  response.success(res, { message: 'Delivery statistics fetched', data: stats });
});

module.exports = { list, getById, updateStatus, assignDriver, cancel, getStatistics };
