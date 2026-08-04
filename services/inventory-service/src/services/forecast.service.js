/**
 * Calculates forecast data for an inventory product
 * @param {Object} inventoryProduct - The inventory item from the database
 * @returns {Object} Forecast data including suggested quantity and reorder point
 */
const calculateForecast = (inventoryProduct) => {
  const currentStock = Number(inventoryProduct.currentStock) || 0;
  
  // dailyConsumption from inventory or product, default to 5
  const velocity = inventoryProduct.dailyConsumption !== undefined && inventoryProduct.dailyConsumption !== null 
    ? Number(inventoryProduct.dailyConsumption) 
    : 5;
  const leadTime = Number(inventoryProduct.leadTime) || 3;
  
  const daysOfSupply = velocity > 0 ? currentStock / velocity : 999;
  
  const safetyStock = Math.ceil(leadTime * velocity * 1.2);
  const reorderPoint = Math.ceil(leadTime * velocity + safetyStock);
  
  const maximumStock = Number(inventoryProduct.maximumStock) || 100;
  
  let suggestedQuantity = 0;
  if (currentStock < reorderPoint) {
    suggestedQuantity = Math.max(0, maximumStock - currentStock);
  }
  
  const now = new Date();
  const estimatedStockoutDate = new Date(now.getTime() + daysOfSupply * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return {
    productId: inventoryProduct.productId,
    warehouseId: inventoryProduct.warehouseId,
    currentStock,
    velocity, // dailyConsumption
    leadTime,
    daysOfSupply,
    safetyStock,
    reorderPoint,
    suggestedQuantity,
    maximumStock,
    estimatedStockoutDate,
  };
};

module.exports = {
  calculateForecast,
};
