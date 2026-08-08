const { response, utils } = require('@freshmart/service-shared');
const adminOrderService = require('../services/admin-order.service');

const listOrders = utils.asyncHandler(async (req, res) => {
  const { items, meta } = await adminOrderService.listOrders(req.query);
  response.success(res, { message: 'Admin orders fetched', data: items, meta });
});

const getOrder = utils.asyncHandler(async (req, res) => {
  const order = await adminOrderService.getOrder(req.params.orderId);
  response.success(res, { message: 'Admin order fetched', data: order });
});

const updateStatus = utils.asyncHandler(async (req, res) => {
  const statusToSet = req.body.orderStatus || req.body.status || req.body.rawOrderStatus || req.body.order_status || 'DELIVERED';
  const order = await adminOrderService.updateStatus(
    req.params.orderId,
    statusToSet,
    req.eventContext
  );
  response.success(res, { message: `Order status updated to '${order.orderStatus}'`, data: order });
});

module.exports = { getOrder, listOrders, updateStatus };
