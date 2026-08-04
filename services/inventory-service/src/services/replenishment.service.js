const axios = require('axios');
const inventoryRepository = require('../repositories/inventory.repository');
const forecastService = require('./forecast.service');
const sharedLogger = require('@freshmart/service-shared').logger;

const logger = sharedLogger.child({ service: 'inventory-service', module: 'replenishment' });

/**
 * Scans all inventory to identify replenishment needs.
 * @returns {Promise<Array>} Array of suggested order objects
 */
const scanInventoryForReplenishment = async () => {
  // Call repository to get all inventory
  let allInventory = [];
  if (typeof inventoryRepository.listAllInventory === 'function') {
    allInventory = await inventoryRepository.listAllInventory();
  } else {
    // Fallback if listAllInventory is not implemented yet, try listAll
    const res = await inventoryRepository.listAll({ limit: 10000 });
    allInventory = res.items || [];
  }

  const suggestions = [];

  for (const item of allInventory) {
    // Ignore inactive products. The property is productAvailable in toDomain.
    if (item.productAvailable === false || item.status === 'INACTIVE') continue;

    const forecast = forecastService.calculateForecast(item);
    
    if (forecast.currentStock < forecast.reorderPoint && forecast.suggestedQuantity > 0) {
      const suggestedOrder = {
        productId: forecast.productId,
        warehouseId: forecast.warehouseId,
        supplierId: item.supplierId || 'SUP-UNKNOWN',
        currentStock: forecast.currentStock,
        dailyConsumption: forecast.velocity,
        leadTime: forecast.leadTime,
        safetyStock: forecast.safetyStock,
        recommendedQty: forecast.suggestedQuantity,
        estimatedStockoutDate: forecast.estimatedStockoutDate,
        unitCost: Number(item.unitCost) || 10.0,
      };
      
      suggestions.push(suggestedOrder);
    }
  }

  return suggestions;
};

/**
 * Runs the replenishment job to auto-generate POs.
 * @param {Object} context The event context
 * @returns {Promise<Object>} Replenishment report
 */
const runReplenishmentJob = async (context = {}) => {
  logger.info('Starting runReplenishmentJob', { correlationId: context.correlationId });
  
  const suggestions = await scanInventoryForReplenishment();
  let posGenerated = 0;
  
  if (suggestions.length > 0) {
    try {
      const adminServiceUrl = process.env.ADMIN_SERVICE_URL || 'http://localhost:3000';
      const endpoint = `${adminServiceUrl}/v1/admin/purchase-orders/auto-generate`;
      const token = process.env.INTERNAL_SERVICE_TOKEN || '';
      
      logger.info(`Sending ${suggestions.length} suggestions to admin-service`);
      
      await axios.post(endpoint, { items: suggestions }, {
        headers: {
          'x-internal-service-token': token,
          'Content-Type': 'application/json',
        },
      });
      
      posGenerated = suggestions.length;
    } catch (error) {
      logger.error('Failed to auto-generate POs via admin-service', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Replenishment Job Failed: ' + error.message);
    }
  }
  
  const report = {
    itemsEvaluated: suggestions.length,
    posGenerated,
    timestamp: new Date().toISOString(),
  };
  
  logger.info('ReplenishmentJob completed', report);
  return report;
};

module.exports = {
  scanInventoryForReplenishment,
  runReplenishmentJob,
};
