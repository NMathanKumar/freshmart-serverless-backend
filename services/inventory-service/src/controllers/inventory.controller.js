const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created } = require('@freshmart/service-shared').response;
const { emitBusinessMetrics } = require('@freshmart/service-shared').metrics;
const inventoryService = require('../services/inventory.service');
const forecastService = require('../services/forecast.service');
const replenishmentService = require('../services/replenishment.service');

const listInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.listInventory(req.query);
  success(res, {
    message: 'Inventory list fetched',
    data: result.items,
    meta: { total: result.total, page: result.page, limit: result.limit },
  });
});

const getInventoryByProductId = asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouseId;
  const inventory = await inventoryService.getInventoryByProductId(req.params.productId, warehouseId);
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
  const result = await inventoryService.increaseStock(req.params.productId, req.body, req.eventContext);
  success(res, { message: 'Stock increased', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const decrease = asyncHandler(async (req, res) => {
  const result = await inventoryService.decreaseStock(req.params.productId, req.body, req.eventContext);
  success(res, { message: 'Stock decreased', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const adjustStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.params.productId, req.body, req.eventContext);
  success(res, { message: 'Stock adjusted', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const adjustDamage = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.params.productId, {
    ...req.body,
    movementType: 'DAMAGE',
    reason: 'DAMAGE',
    amount: -Math.abs(req.body.amount)
  }, req.eventContext);
  success(res, { message: 'Damage adjustment submitted', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const adjustExpired = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.params.productId, {
    ...req.body,
    movementType: 'EXPIRED',
    reason: 'EXPIRED',
    amount: -Math.abs(req.body.amount)
  }, req.eventContext);
  success(res, { message: 'Expired adjustment submitted', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const adjustReturn = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.params.productId, {
    ...req.body,
    movementType: 'RETURN',
    reason: 'RETURN',
    amount: Math.abs(req.body.amount)
  }, req.eventContext);
  success(res, { message: 'Return adjustment submitted', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const adjustCycleCount = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.params.productId, {
    ...req.body,
    movementType: 'CYCLE_COUNT',
    reason: 'CYCLE_COUNT',
  }, req.eventContext);
  success(res, { message: 'Cycle count adjustment submitted', data: result.inventory, meta: { movementId: result.movementId, status: result.status } });
});

const approveAdjustment = asyncHandler(async (req, res) => {
  const result = await inventoryService.approveAdjustment(req.params.productId, req.params.movementId, req.eventContext);
  success(res, { message: 'Adjustment approved', data: result.inventory });
});

const rejectAdjustment = asyncHandler(async (req, res) => {
  const result = await inventoryService.rejectAdjustment(req.params.productId, req.params.movementId, req.eventContext);
  success(res, { message: 'Adjustment rejected', data: result.inventory });
});

const listMovements = asyncHandler(async (req, res) => {
  if (req.params.productId) {
    const movements = await inventoryService.listMovements(req.params.productId, req.query);
    success(res, { message: 'Movements fetched', data: movements });
  } else {
    const result = await inventoryService.listAllMovements(req.query);
    success(res, {
      message: 'All movements fetched',
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  }
});

const lowStockAlerts = asyncHandler(async (req, res) => {
  const alerts = await inventoryService.listLowStockAlerts();
  success(res, { message: 'Low stock alerts', data: alerts });
});

const getForecasts = asyncHandler(async (req, res) => {
  // We can scan all inventory and map to forecasts
  const inventoryRepository = require('../repositories/inventory.repository');
  const allInventory = await inventoryRepository.listAllInventory();
  const forecasts = allInventory.map(item => forecastService.calculateForecast(item));
  success(res, { message: 'Forecasts fetched', data: forecasts });
});

const getForecastByProductId = asyncHandler(async (req, res) => {
  const warehouseId = req.query.warehouseId;
  const inventory = await inventoryService.getInventoryByProductId(req.params.productId, warehouseId);
  if (!inventory) {
    const { NotFoundError } = require('@freshmart/service-shared').errors;
    throw new NotFoundError('Inventory not found');
  }
  // To get the full item for forecast (including max stock, etc.)
  const inventoryRepository = require('../repositories/inventory.repository');
  const fullItem = await inventoryRepository.findByProductId(req.params.productId, warehouseId);
  
  const forecast = forecastService.calculateForecast(fullItem);
  success(res, { message: 'Forecast fetched', data: forecast });
});

const getReplenishmentSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await replenishmentService.scanInventoryForReplenishment();
  success(res, { message: 'Replenishment suggestions fetched', data: suggestions });
});

const runReplenishmentJob = asyncHandler(async (req, res) => {
  const report = await replenishmentService.runReplenishmentJob(req.eventContext);
  success(res, { message: 'Replenishment job executed', data: report });
});

module.exports = {
  listInventory,
  getInventoryByProductId,
  createInventory,
  updateInventory,
  increase,
  decrease,
  adjustStock,
  adjustDamage,
  adjustExpired,
  adjustReturn,
  adjustCycleCount,
  approveAdjustment,
  rejectAdjustment,
  listMovements,
  lowStockAlerts,
  getForecasts,
  getForecastByProductId,
  getReplenishmentSuggestions,
  runReplenishmentJob,
};
