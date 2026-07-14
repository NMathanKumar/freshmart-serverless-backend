const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created } = require('@freshmart/service-shared').response;
const orderService = require('../services/order.service');

const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrderFromCart(req.user.userId, req.body, req.eventContext);
  created(res, { message: 'Order placed successfully', data: order });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await orderService.getUserOrders(req.user.userId, req.query);
  success(res, { message: 'Orders fetched', data: items, meta });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  success(res, { message: 'Order fetched', data: order });
});

const trackOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  success(res, {
    message: 'Order status fetched',
    data: {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      pickupTime: order.pickupTime,
    },
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.orderStatus,
    req.eventContext
  );
  success(res, { message: `Order status updated to '${order.orderStatus}'`, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user, req.eventContext);
  success(res, { message: 'Order cancelled', data: order });
});

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await orderService.getAllOrdersAdmin(req.query);
  success(res, { message: 'All orders fetched', data: items, meta });
});

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrdersAdmin,
};
