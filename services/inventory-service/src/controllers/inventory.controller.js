const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created } = require('@freshmart/service-shared').response;
const inventoryService = require('../services/inventory.service');

const listInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.listInventory(req.query);
  success(res, {
    message: 'Inventory list fetched',
    data: result.items,
    meta: { total: result.total, page: result.page, limit: result.limit },
  });
});

const getInventoryByProductId = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.getInventoryByProductId(req.params.productId);
  success(res, { message: 'Inventory fetched', data: inventory });
});

const createInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.createInventory(req.body, req.eventContext);
  created(res, { message: 'Inventory created', data: inventory });
});

const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.updateInventory(
    { productId: req.params.productId, ...req.body },
    req.eventContext
  );
  success(res, { message: 'Inventory updated', data: inventory });
});

const increase = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.increaseStock(req.params.productId, req.body, req.eventContext);
  success(res, { message: 'Stock increased', data: inventory });
});

const decrease = asyncHandler(async (req, res) => {
  const inventory = await inventoryService.decreaseStock(req.params.productId, req.body, req.eventContext);
  success(res, { message: 'Stock decreased', data: inventory });
});

const lowStockAlerts = asyncHandler(async (req, res) => {
  const alerts = await inventoryService.listLowStockAlerts();
  success(res, { message: 'Low stock alerts', data: alerts });
});

module.exports = {
  listInventory,
  getInventoryByProductId,
  createInventory,
  updateInventory,
  increase,
  decrease,
  lowStockAlerts,
};
