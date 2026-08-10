const {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const tableName = () => {
  return config.dynamodb.tables.inventory || process.env.DDB_TABLE_INVENTORY || 'freshmart-dev-inventory';
};

const key = (productId, warehouseId) => {
  if (!warehouseId) throw new Error('warehouseId is required for inventory keys');
  return {
    pk: `PRODUCT#${productId}`,
    sk: `WAREHOUSE#${warehouseId}`,
  };
};

const movementKey = (productId, timestamp, uuid) => ({
  pk: `PRODUCT#${productId}`,
  sk: `MOVEMENT#${timestamp}#${uuid}`,
});

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const computeStatus = (currentStock, minimumStock) => {
  const stock = normalizeNumber(currentStock);
  const minimum = normalizeNumber(minimumStock);
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= minimum) return 'LOW_STOCK';
  return 'ACTIVE';
};

const computeAvailability = (currentStock, reservedStock = 0) =>
  Math.max(normalizeNumber(currentStock) - normalizeNumber(reservedStock), 0);

const resolveProductId = (productId, foodId) => productId || foodId;

const toDomain = (item) => {
  if (!item) return null;
  const status = item.status || computeStatus(item.currentStock, item.minimumStock);
  return {
    inventoryId: item.inventoryId || null,
    productId: item.productId,
    warehouseId: item.sk ? item.sk.replace('WAREHOUSE#', '') : null,
    currentStock: normalizeNumber(item.currentStock),
    minimumStock: normalizeNumber(item.minimumStock),
    reservedStock: normalizeNumber(item.reservedStock),
    availableStock: normalizeNumber(item.availableStock),
    unit: item.unit || null,
    status,
    isLowStock: item.isLowStock ?? status !== 'ACTIVE',
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    version: normalizeNumber(item.version),
    productName: item.productName || null,
    productAvailable: item.productAvailable ?? status !== 'OUT_OF_STOCK',
    dailyConsumption: item.dailyConsumption ? Number(item.dailyConsumption) : undefined,
    maximumStock: item.maximumStock ? Number(item.maximumStock) : undefined,
    leadTime: item.leadTime ? Number(item.leadTime) : undefined,
    supplierId: item.supplierId || undefined,
    unitCost: item.unitCost ? Number(item.unitCost) : undefined,
  };
};

const toMovementDomain = (item) => {
  if (!item) return null;
  return {
    movementId: item.movementId,
    movementNumber: item.movementNumber,
    productId: item.productId,
    sku: item.sku,
    warehouseId: item.warehouseId,
    movementType: item.movementType,
    quantity: normalizeNumber(item.quantity),
    beforeQuantity: normalizeNumber(item.beforeQuantity),
    afterQuantity: normalizeNumber(item.afterQuantity),
    reason: item.reason,
    status: item.status || 'COMPLETED',
    referenceType: item.referenceType,
    referenceId: item.referenceId,
    remarks: item.remarks,
    createdBy: item.createdBy,
    approvedBy: item.approvedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    transactionId: item.transactionId,
    ip: item.ip,
    source: item.source,
    device: item.device,
    sk: item.sk,
  };
};

const loadInventory = async (productId, warehouseId) => {
  if (!productId || !warehouseId) return null;
  const result = await documentClient.send(
    new GetCommand({ TableName: tableName(), Key: key(productId, warehouseId) })
  );
  return result.Item ? toDomain(result.Item) : null;
};

const findByProductId = async (productId, warehouseId) => loadInventory(productId, warehouseId);

const listAll = async ({ page = 1, limit = 20, warehouseId, search, status } = {}) => {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: { ':skPrefix': 'WAREHOUSE#' },
    })
  );

  let items = (result.Items || []).map(toDomain).filter(Boolean);
  if (warehouseId) {
    items = items.filter((item) => item.warehouseId === warehouseId);
  }
  if (status) {
    items = items.filter((item) => item.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    items = items.filter((item) => (item.productName && item.productName.toLowerCase().includes(s)) || (item.productId && item.productId.toLowerCase().includes(s)));
  }

  const deduped = Array.from(new Map(items.map((item) => [`${item.productId}#${item.warehouseId}`, item])).values()).sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: deduped.slice(start, start + safeLimit),
    total: deduped.length,
    page: safePage,
    limit: safeLimit,
  };
};

const listAllInventory = async () => {
  let allItems = [];
  let lastEvaluatedKey = undefined;

  do {
    const command = new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: { ':skPrefix': 'WAREHOUSE#' },
      ExclusiveStartKey: lastEvaluatedKey,
    });
    const result = await documentClient.send(command);
    allItems = allItems.concat((result.Items || []).map(toDomain).filter(Boolean));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  const deduped = Array.from(new Map(allItems.map((item) => [`${item.productId}#${item.warehouseId}`, item])).values());
  return deduped;
};

const listLowStockAlerts = async () => {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'begins_with(sk, :skPrefix) AND (#status = :low OR #status = :out)',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':skPrefix': 'WAREHOUSE#', ':low': 'LOW_STOCK', ':out': 'OUT_OF_STOCK' },
    })
  );
  return (result.Items || []).map(toDomain).filter(Boolean);
};

const createInventory = async ({
  inventoryId,
  productId,
  foodId,
  warehouseId,
  currentStock,
  minimumStock,
  reservedStock = 0,
  unit,
}) => {
  const now = new Date().toISOString();
  const computedStatus = computeStatus(currentStock, minimumStock);
  const availableStock = computeAvailability(currentStock, reservedStock);
  const resolvedProductId = resolveProductId(productId, foodId);

  const item = {
    ...key(resolvedProductId, warehouseId),
    inventoryId: inventoryId || `INV_${resolvedProductId}`,
    productId: resolvedProductId,
    currentStock: normalizeNumber(currentStock),
    minimumStock: normalizeNumber(minimumStock),
    reservedStock: normalizeNumber(reservedStock),
    availableStock,
    unit: unit || 'pcs',
    status: computedStatus,
    isLowStock: computedStatus !== 'ACTIVE',
    version: 0,
    createdAt: now,
    updatedAt: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk)',
    })
  );

  return toDomain(item);
};

const updateInventory = async ({
  productId,
  foodId,
  warehouseId,
  currentStock,
  minimumStock,
  reservedStock = 0,
  unit,
  expectedVersion,
  inventoryId,
  createdAt,
}) => {
  const now = new Date().toISOString();
  const computedStatus = computeStatus(currentStock, minimumStock);
  const availableStock = computeAvailability(currentStock, reservedStock);
  const resolvedProductId = resolveProductId(productId, foodId);
  const nextVersion = normalizeNumber(expectedVersion || 0) + 1;

  const item = {
    ...key(resolvedProductId, warehouseId),
    inventoryId: inventoryId || `INV_${resolvedProductId}`,
    productId: resolvedProductId,
    currentStock: normalizeNumber(currentStock),
    minimumStock: normalizeNumber(minimumStock),
    reservedStock: normalizeNumber(reservedStock),
    availableStock,
    unit: unit || null,
    status: computedStatus,
    isLowStock: computedStatus !== 'ACTIVE',
    version: nextVersion,
    createdAt: createdAt || now,
    updatedAt: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': normalizeNumber(expectedVersion || 0) },
    })
  );

  return toDomain(item);
};

const adjustInventoryStock = async ({
  productId,
  foodId,
  warehouseId,
  currentStockDelta = 0,
  reservedStockDelta = 0,
  expectedVersion,
  movementDetails = {},
}) => {
  const resolvedProductId = resolveProductId(productId, foodId);
  if (!warehouseId) throw new Error('warehouseId is required for adjustment');
  const current = await loadInventory(resolvedProductId, warehouseId);

  const nextCurrentStock = normalizeNumber(current?.currentStock || 0) + normalizeNumber(currentStockDelta);
  if (nextCurrentStock < 0) {
    const error = new Error(`Insufficient stock for product '${productId}'`);
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  const nextReservedStock = Math.max(
    normalizeNumber(current?.reservedStock || 0) + normalizeNumber(reservedStockDelta),
    0
  );
  const nextVersion = normalizeNumber(current?.version || 0) + 1;
  const now = new Date().toISOString();
  const minimumStock = current?.minimumStock || 10;
  const computedStatus = computeStatus(nextCurrentStock, minimumStock);
  const availableStock = computeAvailability(nextCurrentStock, nextReservedStock);

  const inventoryItem = {
    ...key(resolvedProductId, warehouseId),
    inventoryId: current?.inventoryId || `INV_${resolvedProductId}`,
    productId: resolvedProductId,
    currentStock: nextCurrentStock,
    minimumStock: minimumStock,
    reservedStock: nextReservedStock,
    availableStock: availableStock,
    unit: current?.unit || 'pcs',
    status: computedStatus,
    isLowStock: computedStatus !== 'ACTIVE',
    createdAt: current?.createdAt || now,
    updatedAt: now,
    version: nextVersion,
  };

  const transactItems = [];

  // Update Inventory Item ONLY IF status is COMPLETED
  const mvtStatus = movementDetails.status || 'COMPLETED';
  if (mvtStatus === 'COMPLETED') {
    transactItems.push({
      Put: {
        TableName: tableName(),
        Item: inventoryItem,
        ConditionExpression: current ? '#version = :expectedVersion' : 'attribute_not_exists(pk)',
        ExpressionAttributeNames: current ? { '#version': 'version' } : undefined,
        ExpressionAttributeValues: current ? { ':expectedVersion': normalizeNumber(current.version || 0) } : undefined,
      }
    });
  }

  // Create or Update Movement Ledger Item
  if (movementDetails && movementDetails.movementType) {
    const uuid = randomUUID();
    const isUpdate = !!movementDetails.movementId && !!movementDetails.sk;
    const mvtKey = isUpdate ? { pk: `PRODUCT#${resolvedProductId}`, sk: movementDetails.sk } : movementKey(resolvedProductId, now, uuid);
    const movementId = isUpdate ? movementDetails.movementId : `MVT_${uuid.replace(/-/g, '')}`;
    
    const movementItem = {
      ...mvtKey,
      movementId,
      movementNumber: movementDetails.movementNumber || movementId,
      productId: resolvedProductId,
      sku: movementDetails.sku || resolvedProductId,
      warehouseId: movementDetails.warehouseId || warehouseId,
      movementType: movementDetails.movementType,
      quantity: normalizeNumber(currentStockDelta),
      beforeQuantity: normalizeNumber(current?.currentStock || 0),
      afterQuantity: mvtStatus === 'COMPLETED' ? nextCurrentStock : normalizeNumber(current?.currentStock || 0),
      reason: movementDetails.reason || 'SYSTEM_CORRECTION',
      status: mvtStatus,
      referenceType: movementDetails.referenceType || 'SYSTEM',
      referenceId: movementDetails.referenceId || 'NONE',
      remarks: movementDetails.remarks || '',
      createdBy: movementDetails.createdBy || 'SYSTEM',
      approvedBy: movementDetails.approvedBy || null,
      createdAt: now,
      updatedAt: now,
      transactionId: movementDetails.transactionId || randomUUID(),
      ip: movementDetails.ip || null,
      source: movementDetails.source || 'inventory-service',
      device: movementDetails.device || null,
      // GSIs
      gsi1pk: movementDetails.warehouseId || warehouseId,
      gsi1sk: now,
      gsi2pk: movementDetails.movementType,
      gsi2sk: now,
      gsi3pk: movementDetails.referenceId || 'NONE',
      gsi3sk: now,
    };

    transactItems.push({
      Put: {
        TableName: tableName(),
        Item: movementItem,
        ConditionExpression: isUpdate ? 'attribute_exists(pk)' : 'attribute_not_exists(pk)',
      }
    });
  }

  await documentClient.send(
    new TransactWriteCommand({
      TransactItems: transactItems,
    })
  );

  return { inventory: mvtStatus === 'COMPLETED' ? toDomain(inventoryItem) : current, movementId: transactItems.find(t => t.Put.Item.movementId)?.Put.Item.movementId };
};

const getMovement = async (productId, movementId) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      FilterExpression: 'movementId = :movementId',
      ExpressionAttributeValues: {
        ':pk': `PRODUCT#${productId}`,
        ':skPrefix': 'MOVEMENT#',
        ':movementId': movementId,
      },
      Limit: 1,
    })
  );
  return result.Items && result.Items.length > 0 ? toMovementDomain(result.Items[0]) : null;
};

const deleteInventory = async (productId, warehouseId) => {
  if (!warehouseId) throw new Error('warehouseId is required for delete');
  await documentClient.send(
    new DeleteCommand({ TableName: tableName(), Key: key(productId, warehouseId) })
  );
  return true;
};

const listMovements = async (productId, { limit = 50 } = {}) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `PRODUCT#${productId}`,
        ':skPrefix': 'MOVEMENT#',
      },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })
  );
  return (result.Items || []).map(toMovementDomain);
};

const listAllMovements = async ({ page = 1, limit = 20, warehouseId, movementType } = {}) => {
  let command;
  if (warehouseId) {
    command = new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :warehouseId',
      ExpressionAttributeValues: { ':warehouseId': warehouseId },
      ScanIndexForward: false,
    });
  } else if (movementType) {
    command = new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi2',
      KeyConditionExpression: 'gsi2pk = :movementType',
      ExpressionAttributeValues: { ':movementType': movementType },
      ScanIndexForward: false,
    });
  } else {
    command = new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: { ':skPrefix': 'MOVEMENT#' },
    });
  }

  const result = await documentClient.send(command);
  let items = (result.Items || []).map(toMovementDomain).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
    page: safePage,
    limit: safeLimit,
  };
};

module.exports = {
  loadInventory,
  findByProductId,
  findByFoodId: findByProductId,
  listAll,
  listAllInventory,
  listLowStockAlerts,
  createInventory,
  updateInventory,
  adjustInventoryStock,
  deleteInventory,
  listMovements,
  listAllMovements,
  getMovement,
  key,
};
