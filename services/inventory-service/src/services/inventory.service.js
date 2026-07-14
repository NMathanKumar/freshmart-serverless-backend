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

const requireInventory = async (productId) => {
  const inventory = await inventoryRepository.findByProductId(productId);
  if (!inventory) {
    throw new NotFoundError(`Inventory not found for product '${productId}'`);
  }
  return inventory;
};

const listInventory = async ({ page, limit }) => inventoryRepository.listAll({ page, limit });

const getInventoryByProductId = async (productId) => buildResponseInventory(await requireInventory(productId));

const createInventory = async ({ productId, currentStock, minimumStock, unit }, context = {}) => {
  if (!productId) throw new BadRequestError('productId is required');
  const existing = await inventoryRepository.findByProductId(productId);
  if (existing) throw new ConflictError(`Inventory already exists for product '${productId}'`);

  const inventory = await inventoryRepository.createInventory({
    inventoryId: genId('INV'),
    productId,
    currentStock: normalizePositiveInteger(currentStock, 'currentStock'),
    minimumStock: normalizePositiveInteger(minimumStock, 'minimumStock'),
    unit,
  });

  await publishInventoryState(inventory, context);
  return buildResponseInventory(inventory);
};

const updateInventory = async ({ productId, currentStock, minimumStock, unit }, context = {}) => {
  const existing = await requireInventory(productId);
  const inventory = await withConditionalRetry(async () =>
    inventoryRepository.updateInventory({
      productId,
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

const adjustStock = async (productId, delta, context = {}, { eventId = null, publish = true } = {}) => {
  const existing = await requireInventory(productId);
  let inventory;
  try {
    inventory = await withConditionalRetry(async () =>
      inventoryRepository.adjustInventoryStock({
        productId,
        currentStockDelta: delta,
        expectedVersion: Number(existing.version || 0),
        eventId,
      })
    );
  } catch (error) {
    if (error?.code === 'INSUFFICIENT_STOCK') {
      throw new BadRequestError(error.message);
    }
    throw error;
  }

  if (!inventory) {
    throw new NotFoundError(`Inventory not found for product '${productId}'`);
  }

  if (publish) {
    await publishInventoryState(inventory, context);
    if (delta > 0) {
      await publishInventoryRestocked(
        { inventory: buildResponseInventory(inventory), delta, reason: context.reason || 'manual-restock' },
        { ...context, source: 'inventory-service' }
      );
    }
  }

  return buildResponseInventory(inventory);
};

const increaseStock = async (productId, { amount, unit }, context = {}) => {
  const current = await requireInventory(productId);
  const increment = normalizeQuantity(amount, 'amount');
  const inventory = await inventoryRepository.updateInventory({
    productId,
    currentStock: Number(current.currentStock) + increment,
    minimumStock: Number(current.minimumStock),
    reservedStock: Number(current.reservedStock || 0),
    unit: unit || current.unit,
    expectedVersion: Number(current.version || 0),
    inventoryId: current.inventoryId,
    createdAt: current.createdAt,
  });

  await publishInventoryState(inventory, context);
  await publishInventoryRestocked(
    { inventory: buildResponseInventory(inventory), delta: increment },
    { ...context, source: 'inventory-service' }
  );
  return buildResponseInventory(inventory);
};

const decreaseStock = async (productId, { amount }, context = {}) =>
  adjustStock(productId, -normalizeQuantity(amount, 'amount'), context);

const validateStockForOrderInConn = async (_conn, { productId, foodId, quantity }) => {
  const id = productId || foodId;
  const inventory = await requireInventory(id);
  const requested = normalizeQuantity(quantity, 'quantity');
  if (Number(inventory.currentStock) < requested) {
    throw new BadRequestError(
      `Insufficient stock for product '${id}'. Available: ${inventory.currentStock}, requested: ${requested}`
    );
  }
  return inventory;
};

const deductStockAfterOrderInConn = async (_conn, { productId, foodId, quantity }) => {
  const id = productId || foodId;
  const requested = normalizeQuantity(quantity, 'quantity');
  let inventory;
  try {
    inventory = await adjustStock(id, -requested, {}, { publish: false });
  } catch (error) {
    if (error?.code === 'INSUFFICIENT_STOCK') {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
  return inventory;
};

const restoreStockAfterOrderCancellationInConn = async (_conn, { productId, foodId, quantity }, context = {}) => {
  const id = productId || foodId;
  return adjustStock(id, normalizeQuantity(quantity, 'quantity'), context, {
    eventId: context.eventId || null,
    publish: true,
  });
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
    if (!id) continue;
    // eslint-disable-next-line no-await-in-loop
    const inventory = await requireInventory(id).catch(() => null);
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
    if (!id) {
      throw new BadRequestError("Invalid payload for 'OrderCancelled'. Missing required field: order.items.productId");
    }
    // eslint-disable-next-line no-await-in-loop
    const restored = await restoreStockAfterOrderCancellationInConn(
      null,
      { productId: id, quantity: item.quantity || 1 },
      { ...context, reason: 'order-cancelled' }
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
  validateStockForOrderInConn,
  deductStockAfterOrderInConn,
  restoreStockAfterOrderCancellationInConn,
  listLowStockAlerts,
  handleOrderPlacedEvent,
  handleOrderCancelledEvent,
  buildResponseInventory,
};
