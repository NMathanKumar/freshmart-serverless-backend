const { constants, errors, utils } = require('@freshmart/service-shared');
const adminOrderRepository = require('../repositories/admin-order.repository');
const orderRepository = require('../repositories/order.repository');
const orderOperations = require('./order.service');

const { ConflictError, NotFoundError } = errors;

const createAdminOrderService = ({
  adminRepository = adminOrderRepository,
  orders = orderRepository,
  operations = orderOperations,
} = {}) => {
  const enrichOrder = async (order) => {
    const customer = await adminRepository.findCustomerById(order.userId);
    return adminOrderRepository.normalizeOrder(order, customer);
  };

  const listOrders = async (query) => {
    const result = await adminRepository.list(query);
    return {
      items: result.items,
      meta: {
        ...utils.pagination.buildMeta(result),
        summary: result.summary,
      },
    };
  };

  const getOrder = async (orderId) => {
    const order = await orders.findById(orderId);
    if (!order) throw new NotFoundError(`Order '${orderId}' not found`);
    return enrichOrder(order);
  };

  const updateStatus = async (orderId, nextStatus, context = {}) => {
    const current = await orders.findById(orderId);
    if (!current) throw new NotFoundError(`Order '${orderId}' not found`);
    if (current.orderStatus === nextStatus) return enrichOrder(current);

    const allowedTransitions = {
      PLACED: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['READY', 'CANCELLED'],
      READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    const allowed = allowedTransitions[current.orderStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ConflictError(`Cannot transition order status from '${current.orderStatus}' to '${nextStatus}'`);
    }

    try {
      const updated = nextStatus === constants.ORDER_STATUS.CANCELLED
        ? await operations.cancelOrder(orderId, { role: constants.ROLES.ADMIN }, context)
        : await operations.updateOrderStatus(orderId, nextStatus, context);
      return enrichOrder(updated);
    } catch (error) {
      if (error?.name === 'ConditionalCheckFailedException') {
        throw new ConflictError(`Order '${orderId}' changed while the status update was being applied`);
      }
      throw error;
    }
  };

  return { getOrder, listOrders, updateStatus };
};

const service = createAdminOrderService();

module.exports = service;
module.exports.createAdminOrderService = createAdminOrderService;
