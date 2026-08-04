const { buildMeta } = require('@freshmart/service-shared').utils.pagination;
const fulfillmentService = require('../services/fulfillment.service');

const createFulfillment = async (req, res, next) => {
  try {
    const { orderId, warehouseId, priority } = req.body;
    const fulfillment = await fulfillmentService.createFulfillment(orderId, warehouseId, priority);
    res.status(201).json({ data: fulfillment });
  } catch (error) {
    next(error);
  }
};

const getFulfillment = async (req, res, next) => {
  try {
    const { fulfillmentId } = req.params;
    const fulfillment = await fulfillmentService.getFulfillment(fulfillmentId);
    res.status(200).json({ data: fulfillment });
  } catch (error) {
    next(error);
  }
};

const allocateOrder = async (req, res, next) => {
  try {
    const { fulfillmentId } = req.params;
    const fulfillment = await fulfillmentService.allocateOrder(fulfillmentId);
    res.status(200).json({ data: fulfillment });
  } catch (error) {
    next(error);
  }
};

const updateFulfillmentStatus = async (req, res, next) => {
  try {
    const { fulfillmentId } = req.params;
    const { status } = req.body;
    const fulfillment = await fulfillmentService.updateFulfillmentStatus(fulfillmentId, status);
    res.status(200).json({ data: fulfillment });
  } catch (error) {
    next(error);
  }
};

const listFulfillments = async (req, res, next) => {
  try {
    const { warehouseId, status } = req.query;
    const fulfillments = await fulfillmentService.listFulfillments(warehouseId, status);
    res.status(200).json({ data: fulfillments, meta: buildMeta({ page: 1, limit: fulfillments.length, total: fulfillments.length }) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFulfillment,
  getFulfillment,
  allocateOrder,
  updateFulfillmentStatus,
  listFulfillments,
};
