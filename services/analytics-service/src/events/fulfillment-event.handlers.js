const repository = require('../repositories/fulfillment-analytics.repository');

const getDates = (payload) => {
  const dateStr = payload.createdAt || new Date().toISOString();
  return {
    date: dateStr.split('T')[0],
    month: dateStr.substring(0, 7),
  };
};

const getDiffSeconds = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;
  return Math.max(0, (new Date(endStr).getTime() - new Date(startStr).getTime()) / 1000);
};

const onOrderAllocated = async (payload) => {
  const { date, month } = getDates(payload);
  const orderId = payload.orderId;
  const allocatedAt = payload.allocatedAt || payload.createdAt || new Date().toISOString();

  if (orderId) {
    await repository.saveOrderState(orderId, { allocatedAt });
  }

  await repository.incrementMetric(date, month, 'OrdersWaiting', 1);
};

const onPickListGenerated = async (payload) => {
  const { date, month } = getDates(payload);
  const orderId = payload.orderId;
  const pickedAt = payload.pickedAt || payload.createdAt || new Date().toISOString();

  if (orderId) {
    const state = await repository.getOrderState(orderId);
    if (state && state.allocatedAt) {
      const diff = getDiffSeconds(state.allocatedAt, pickedAt);
      await repository.saveOrderState(orderId, { ...state, pickedAt });
      await repository.incrementMultipleMetrics(date, month, {
        totalPickingTime: diff,
        totalPickingOrders: 1
      });
    }
  }
};

const onOrderPacked = async (payload) => {
  const { date, month } = getDates(payload);
  const orderId = payload.orderId;
  const packedAt = payload.packedAt || payload.createdAt || new Date().toISOString();

  if (orderId) {
    const state = await repository.getOrderState(orderId);
    if (state && state.pickedAt) {
      const diff = getDiffSeconds(state.pickedAt, packedAt);
      await repository.saveOrderState(orderId, { ...state, packedAt });
      await repository.incrementMultipleMetrics(date, month, {
        totalPackingTime: diff,
        totalPackingOrders: 1
      });
    }
  }
};

const onOrderDispatched = async (payload) => {
  const { date, month } = getDates(payload);
  const orderId = payload.orderId;
  const dispatchedAt = payload.dispatchedAt || payload.createdAt || new Date().toISOString();

  if (orderId) {
    const state = await repository.getOrderState(orderId);
    if (state) {
      const metricsToUpdate = {
        OrdersWaiting: -1
      };

      if (state.packedAt) {
        metricsToUpdate.totalDispatchTime = getDiffSeconds(state.packedAt, dispatchedAt);
        metricsToUpdate.totalDispatchOrders = 1;
      }

      if (state.allocatedAt) {
        metricsToUpdate.totalFulfillmentTime = getDiffSeconds(state.allocatedAt, dispatchedAt);
        metricsToUpdate.totalFulfillmentOrders = 1;
      }

      await repository.saveOrderState(orderId, { ...state, dispatchedAt });
      await repository.incrementMultipleMetrics(date, month, metricsToUpdate);
    }
  } else {
    // If no orderId, at least try to decrement OrdersWaiting
    await repository.incrementMetric(date, month, 'OrdersWaiting', -1);
  }
};

module.exports = {
  onOrderAllocated,
  onPickListGenerated,
  onOrderPacked,
  onOrderDispatched
};
