const { genId } = require('@freshmart/service-shared').utils.id;
const { BadRequestError, ConflictError, NotFoundError } = require('@freshmart/service-shared').errors;
const sharedLogger = require('@freshmart/service-shared').logger;
const createProductRepository = require('@freshmart/product-service/src/repositories/product.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const {
  publishInventoryUpdated,
  publishInventoryLow,
  publishInventoryOutOfStock,
  publishInventoryRestocked,
} = require('../events/publisher');

const logger = sharedLogger.child({ service: 'inventory-service' });
let productRepository = null;

const getProductRepository = () => {
  if (!productRepository) {
    productRepository = createProductRepository();
  }
  return productRepository;
};

const isConditionalConflict = (error) =>
  error?.name === 'ConditionalCheckFailedException' ||
  error?.Code === 'ConditionalCheckFailedException' ||
  error?.code === 'ConditionalCheckFailedException';

const withConditionalRetry = async (operation, attempts = 3) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isConditionalConflict(error) || attempt === attempts - 1) {
        throw error;
      }
    }
  }
  throw lastError;
};

const normalizeQuantity = (value, fieldName = 'quantity') => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new BadRequestError(`${fieldName} must be greater than zero`);
  }
  return number;
};

const normalizePositiveInteger = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new BadRequestError(`${fieldName} must be a non-negative integer`);
  }
  return number;
};

const buildResponseInventory = (inventory) => {
  if (!inventory) return null;
  return {
    inventoryId: inventory.inventoryId,
    productId: inventory.productId || inventory.foodId,
    warehouseId: inventory.warehouseId,
    currentStock: Number(inventory.currentStock),
    minimumStock: Number(inventory.minimumStock),
    unit: inventory.unit,
    isLowStock: !!inventory.isLowStock,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,
  };
};

const publishInventoryState = async (inventory, context = {}) => {
  const payload = { inventory: buildResponseInventory(inventory) };
  await publishInventoryUpdated(payload, { ...context, source: 'inventory-service' });

  if (Number(inventory.currentStock) <= Number(inventory.minimumStock)) {
    await publishInventoryLow(payload, { ...context, source: 'inventory-service' });
  }
  if (Number(inventory.currentStock) === 0) {
    await publishInventoryOutOfStock(payload, { ...context, source: 'inventory-service' });
  }
};

const requireInventory = async (productId, warehouseId) => {
  if (!warehouseId) throw new BadRequestError('warehouseId is required');
  let inventory = await inventoryRepository.findByProductId(productId, warehouseId);
  if (!inventory) {
    inventory = await inventoryRepository.createInventory({
      inventoryId: `INV_${productId}_${warehouseId}`,
      productId,
      warehouseId,
      currentStock: 100,
      minimumStock: 10,
      unit: 'pcs',
    });
  }
  return inventory;
};

const listInventory = async ({ page, limit, warehouseId, warehouse, search, q, status, category }) => {
  const resolvedWarehouse = warehouseId || (warehouse && warehouse !== 'All Warehouses' && warehouse !== 'all' ? warehouse : undefined);
  return inventoryRepository.listAll({ page, limit, warehouseId: resolvedWarehouse, search: search || q, status, category });
};

const getInventoryByProductId = async (productId, warehouseId) => {
  if (!warehouseId) throw new BadRequestError('warehouseId is required');
  return buildResponseInventory(await requireInventory(productId, warehouseId));
};

const createInventory = async ({ productId, warehouseId, currentStock, minimumStock, unit }, context = {}) => {
  if (!productId) throw new BadRequestError('productId is required');
  if (!warehouseId) throw new BadRequestError('warehouseId is required');
  const existing = await inventoryRepository.findByProductId(productId, warehouseId);
  if (existing) throw new ConflictError(`Inventory already exists for product '${productId}' in warehouse '${warehouseId}'`);

  const inventory = await inventoryRepository.createInventory({
    inventoryId: genId('INV'),
    productId,
    warehouseId,
    currentStock: normalizePositiveInteger(currentStock, 'currentStock'),
    minimumStock: normalizePositiveInteger(minimumStock, 'minimumStock'),
    unit,
  });

  await publishInventoryState(inventory, context);
  return buildResponseInventory(inventory);
};

const updateInventory = async ({ productId, warehouseId, currentStock, minimumStock, unit }, context = {}) => {
  if (!warehouseId) throw new BadRequestError('warehouseId is required');
  const existing = await requireInventory(productId, warehouseId);
  const inventory = await withConditionalRetry(async () =>
    inventoryRepository.updateInventory({
      productId,
      warehouseId,
      currentStock: normalizePositiveInteger(currentStock, 'currentStock'),
      minimumStock: normalizePositiveInteger(minimumStock, 'minimumStock'),
      reservedStock: Number(existing.reservedStock || 0),
      unit: unit || existing.unit,
      expectedVersion: Number(existing.version || 0),
      inventoryId: existing.inventoryId,
      createdAt: existing.createdAt,
    })
  );

  await publishInventoryState(inventory, context);
  return buildResponseInventory(inventory);
};

// Reasons whitelist
const REASON_CODES = [
  'SALE', 'PURCHASE', 'RETURN', 'SUPPLIER_RETURN', 'DAMAGE', 
  'EXPIRED', 'THEFT', 'QUALITY_CHECK', 'CYCLE_COUNT', 
  'TRANSFER', 'INITIAL_STOCK', 'SYSTEM_CORRECTION'
];

const processAdjustment = async (productId, delta, context, movementDetails, publish = true) => {
  if (!movementDetails.warehouseId) throw new BadRequestError('warehouseId is required');
  const existing = await requireInventory(productId, movementDetails.warehouseId);
  
  if (movementDetails.reason && !REASON_CODES.includes(movementDetails.reason)) {
    throw new BadRequestError(`Invalid reason code: ${movementDetails.reason}`);
  }

  let result;
  try {
    result = await withConditionalRetry(async () =>
      inventoryRepository.adjustInventoryStock({
        productId,
        warehouseId: movementDetails.warehouseId,
        currentStockDelta: delta,
        expectedVersion: Number(existing.version || 0),
        movementDetails: {
          ...movementDetails,
          createdBy: context.userId || 'SYSTEM',
          ip: context.ip || null,
          device: context.device || null,
        }
      })
    );
  } catch (error) {
    if (error?.code === 'INSUFFICIENT_STOCK') {
      throw new BadRequestError(error.message);
    }
    throw error;
  }

  const { inventory, movementId } = result;

  if (!inventory) {
    throw new NotFoundError(`Inventory not found for product '${productId}'`);
  }

  if (publish && movementDetails.status !== 'PENDING') {
    await publishInventoryState(inventory, context);
    if (delta > 0) {
      await publishInventoryRestocked(
        { inventory: buildResponseInventory(inventory), delta, reason: movementDetails.reason || 'manual-restock' },
        { ...context, source: 'inventory-service' }
      );
    }
  }

  return { inventory: buildResponseInventory(inventory), movementId, status: movementDetails.status || 'COMPLETED' };
};

const adjustStock = async (productId, payload, context = {}) => {
  const { amount, reason, warehouseId, movementType, referenceType, referenceId, remarks } = payload;
  if (!warehouseId) throw new BadRequestError('warehouseId is required');

  const delta = Number(amount);
  if (isNaN(delta)) {
    throw new BadRequestError('amount must be a valid number');
  }

  const isDamage = movementType === 'DAMAGE' || reason === 'DAMAGE';
  const requiresApproval = isDamage && Math.abs(delta) > 100;
  
  const status = requiresApproval && !context.isSystem ? 'PENDING' : 'COMPLETED';

  const movementDetails = {
    movementType: movementType || (delta > 0 ? 'STOCK_IN' : 'STOCK_OUT'),
    reason: reason || 'SYSTEM_CORRECTION',
    warehouseId,
    referenceType: referenceType || 'MANUAL',
    referenceId: referenceId || 'NONE',
    remarks: remarks || '',
    transactionId: context.correlationId || context.transactionId,
    status,
  };

  return processAdjustment(productId, delta, context, movementDetails, true);
};

const approveAdjustment = async (productId, movementId, context = {}) => {
  const movement = await inventoryRepository.getMovement(productId, movementId);
  if (!movement) {
    throw new NotFoundError(`Movement ${movementId} not found`);
  }
  if (movement.status !== 'PENDING') {
    throw new ConflictError(`Movement is in status ${movement.status} and cannot be approved.`);
  }

  const delta = movement.quantity; // amount to apply
  const movementDetails = {
    ...movement,
    status: 'COMPLETED',
    approvedBy: context.userId || 'SYSTEM',
    remarks: (movement.remarks ? movement.remarks + ' ' : '') + '[APPROVED]',
    referenceType: 'PREVIOUS_MOVEMENT',
    referenceId: movementId,
    transactionId: movement.transactionId,
  };

  return processAdjustment(productId, delta, context, movementDetails, true);
};

const rejectAdjustment = async (productId, movementId, context = {}) => {
  const movement = await inventoryRepository.getMovement(productId, movementId);
  if (!movement) {
    throw new NotFoundError(`Movement ${movementId} not found`);
  }
  if (movement.status !== 'PENDING') {
    throw new ConflictError(`Movement is in status ${movement.status} and cannot be rejected.`);
  }

  const movementDetails = {
    ...movement,
    status: 'REJECTED',
    approvedBy: context.userId || 'SYSTEM',
    remarks: (movement.remarks ? movement.remarks + ' ' : '') + '[REJECTED]',
    referenceType: 'PREVIOUS_MOVEMENT',
    referenceId: movementId,
    transactionId: movement.transactionId,
  };

  return processAdjustment(productId, 0, context, movementDetails, false);
};

const increaseStock = async (productId, { amount, unit, reason, warehouseId, referenceType, referenceId }, context = {}) => {
  const increment = normalizeQuantity(amount, 'amount');
  return adjustStock(productId, {
    amount: increment,
    reason: reason || 'PURCHASE',
    movementType: 'STOCK_IN',
    warehouseId,
    referenceType,
    referenceId,
  }, context);
};

const decreaseStock = async (productId, { amount, reason, warehouseId, referenceType, referenceId }, context = {}) => {
  const decrement = normalizeQuantity(amount, 'amount');
  return adjustStock(productId, {
    amount: -decrement,
    reason: reason || 'SALE',
    movementType: 'STOCK_OUT',
    warehouseId,
    referenceType,
    referenceId,
  }, context);
};

const listMovements = async (productId, options) => {
  return inventoryRepository.listMovements(productId, options);
};

const listAllMovements = async (options) => {
  return inventoryRepository.listAllMovements(options);
};

const validateStockForOrderInConn = async (_conn, { productId, foodId, warehouseId, quantity }) => {
  const id = productId || foodId;
  if (!warehouseId) throw new BadRequestError('warehouseId is required for order validation');
  const inventory = await requireInventory(id, warehouseId);
  const requested = normalizeQuantity(quantity, 'quantity');
  if (Number(inventory.currentStock) < requested) {
    throw new BadRequestError(
      `Insufficient stock for product '${id}' in warehouse '${warehouseId}'. Available: ${inventory.currentStock}, requested: ${requested}`
    );
  }
  return inventory;
};

const deductStockAfterOrderInConn = async (_conn, { productId, foodId, warehouseId, quantity }, context = {}) => {
  const id = productId || foodId;
  if (!warehouseId) throw new BadRequestError('warehouseId is required for order deduction');
  const requested = normalizeQuantity(quantity, 'quantity');
  
  let result;
  try {
    result = await processAdjustment(id, -requested, context, {
      movementType: 'STOCK_OUT',
      reason: 'SALE',
      warehouseId,
      referenceType: 'ORDER',
      referenceId: context.orderId || 'NONE',
      transactionId: context.correlationId || context.orderId,
    }, false);
  } catch (error) {
    if (error?.code === 'INSUFFICIENT_STOCK') {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
  return result.inventory;
};

const restoreStockAfterOrderCancellationInConn = async (_conn, { productId, foodId, warehouseId, quantity }, context = {}) => {
  const id = productId || foodId;
  if (!warehouseId) throw new BadRequestError('warehouseId is required for order cancellation');
  const result = await processAdjustment(id, normalizeQuantity(quantity, 'quantity'), context, {
    movementType: 'RETURN',
    reason: 'RETURN',
    warehouseId,
    referenceType: 'ORDER_CANCELLED',
    referenceId: context.orderId || context.eventId || 'NONE',
    transactionId: context.correlationId || context.eventId,
  }, true);
  return result.inventory;
};

const listLowStockAlerts = async () => {
  const alerts = await inventoryRepository.listLowStockAlerts();
  const enriched = [];

  for (const alert of alerts) {
    let product = null;
    const id = alert.productId || alert.foodId;
    try {
      product = await getProductRepository().findById(id);
    } catch (error) {
      logger.warn('Low stock alert enrichment failed', {
        productId: id,
        error: error.message,
      });
    }

    enriched.push({
      ...alert,
      productId: id,
      productName: product?.productName || alert.productName || null,
      productAvailable: product?.available ?? alert.foodAvailable ?? alert.status !== 'OUT_OF_STOCK',
    });
  }

  return enriched;
};

const handleOrderPlacedEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  const items = Array.isArray(order.items) ? order.items : [];

  logger.info('Observed OrderPlaced event', {
    orderId: order.orderId || null,
    itemCount: items.length,
    correlationId: context.correlationId || null,
    requestId: context.requestId || null,
  });

  const inventorySnapshots = [];
  for (const item of items) {
    const id = item?.productId || item?.foodId;
    const whId = item?.warehouseId;
    if (!id || !whId) continue;
    // eslint-disable-next-line no-await-in-loop
    const inventory = await requireInventory(id, whId).catch(() => null);
    if (inventory) inventorySnapshots.push(buildResponseInventory(inventory));
  }

  return { orderId: order.orderId || null, inventorySnapshots };
};

const handleOrderCancelledEvent = async (payload = {}, context = {}) => {
  const order = payload.order || payload;
  const items = Array.isArray(order.items) ? order.items : [];

  if (!order.orderId) {
    throw new BadRequestError("Invalid payload for 'OrderCancelled'. Missing required field: order.orderId");
  }

  const inventorySnapshots = [];
  for (const item of items) {
    const id = item?.productId || item?.foodId;
    const whId = item?.warehouseId;
    if (!id || !whId) {
      throw new BadRequestError("Invalid payload for 'OrderCancelled'. Missing required field: order.items.productId/warehouseId");
    }
    // eslint-disable-next-line no-await-in-loop
    const restored = await restoreStockAfterOrderCancellationInConn(
      null,
      { productId: id, warehouseId: whId, quantity: item.quantity || 1 },
      { ...context, orderId: order.orderId }
    );
    inventorySnapshots.push(restored);
  }

  return { orderId: order.orderId, inventorySnapshots };
};

module.exports = {
  listInventory,
  getInventoryByProductId,
  // keep legacy alias so order-service calls still resolve
  getInventoryByFoodId: getInventoryByProductId,
  createInventory,
  updateInventory,
  increaseStock,
  decreaseStock,
  adjustStock,
  approveAdjustment,
  rejectAdjustment,
  listMovements,
  listAllMovements,
  validateStockForOrderInConn,
  deductStockAfterOrderInConn,
  restoreStockAfterOrderCancellationInConn,
  listLowStockAlerts,
  handleOrderPlacedEvent,
  handleOrderCancelledEvent,
  buildResponseInventory,
};
