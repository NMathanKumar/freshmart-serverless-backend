const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

const tableName = () => {
  const name = config.dynamodb.tables.inventory;
  if (!name) throw new Error('Missing DDB_TABLE_INVENTORY');
  return name;
};

const key = (productId) => ({
  pk: `PRODUCT#${productId}`,
  sk: 'STOCK',
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

const buildIndexKeys = (currentStock, minimumStock, productId) => {
  const status = computeStatus(currentStock, minimumStock);
  const lowStock = status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
  return {
    status,
    gsi1pk: lowStock ? 'LOW_STOCK' : 'LOW_STOCK#NONE',
    gsi1sk: `PRODUCT#${productId}`,
    gsi2pk: `STATUS#${status}`,
    gsi2sk: `PRODUCT#${productId}`,
    isLowStock: lowStock,
  };
};

const toDomain = (item) => {
  if (!item) return null;
  const status = item.status || computeStatus(item.currentStock, item.minimumStock);
  return {
    inventoryId: item.inventoryId || null,
    productId: item.productId,
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
  };
};

const loadInventory = async (productId) => {
  const result = await documentClient.send(
    new GetCommand({ TableName: tableName(), Key: key(productId) })
  );
  return result.Item ? toDomain(result.Item) : null;
};

const findByProductId = async (productId) => loadInventory(productId);

const listAll = async ({ page = 1, limit = 20 } = {}) => {
  const statuses = ['ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'];
  const queryResults = await Promise.all(
    statuses.map((status) =>
      documentClient
        .send(
          new QueryCommand({
            TableName: tableName(),
            IndexName: 'gsi2',
            KeyConditionExpression: 'gsi2pk = :pk',
            ExpressionAttributeValues: { ':pk': `STATUS#${status}` },
          })
        )
        .then((r) => r.Items || [])
    )
  );

  const items = queryResults.flat().map(toDomain).filter(Boolean);
  const deduped = Array.from(new Map(items.map((item) => [item.productId, item])).values()).sort(
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

const listLowStockAlerts = async () => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :pk',
      ExpressionAttributeValues: { ':pk': 'LOW_STOCK' },
      ScanIndexForward: false,
    })
  );
  return (result.Items || []).map(toDomain).filter(Boolean);
};

const createInventory = async ({
  inventoryId,
  productId,
  foodId,
  currentStock,
  minimumStock,
  reservedStock = 0,
  unit,
}) => {
  const now = new Date().toISOString();
  const computedStatus = computeStatus(currentStock, minimumStock);
  const availableStock = computeAvailability(currentStock, reservedStock);
  const resolvedProductId = resolveProductId(productId, foodId);
  const indexKeys = buildIndexKeys(currentStock, minimumStock, resolvedProductId);

  const item = {
    ...key(resolvedProductId),
    inventoryId,
    productId: resolvedProductId,
    currentStock: normalizeNumber(currentStock),
    minimumStock: normalizeNumber(minimumStock),
    reservedStock: normalizeNumber(reservedStock),
    availableStock,
    unit,
    status: computedStatus,
    isLowStock: indexKeys.isLowStock,
    version: 0,
    createdAt: now,
    updatedAt: now,
    gsi1pk: indexKeys.gsi1pk,
    gsi1sk: indexKeys.gsi1sk,
    gsi2pk: indexKeys.gsi2pk,
    gsi2sk: indexKeys.gsi2sk,
    entityType: 'INVENTORY',
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  );

  return toDomain(item);
};

const updateInventory = async ({
  productId,
  foodId,
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
  const indexKeys = buildIndexKeys(currentStock, minimumStock, resolvedProductId);

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: key(resolvedProductId),
      UpdateExpression:
        'SET inventoryId = :inventoryId, productId = :productId, currentStock = :currentStock, minimumStock = :minimumStock, reservedStock = :reservedStock, availableStock = :availableStock, #unit = :unit, #status = :status, isLowStock = :isLowStock, gsi1pk = :gsi1pk, gsi1sk = :gsi1sk, gsi2pk = :gsi2pk, gsi2sk = :gsi2sk, updatedAt = :updatedAt, #version = :nextVersion, createdAt = if_not_exists(createdAt, :createdAt)',
      ConditionExpression: 'attribute_exists(pk) AND #version = :expectedVersion',
      ExpressionAttributeNames: { '#unit': 'unit', '#status': 'status', '#version': 'version' },
      ExpressionAttributeValues: {
        ':inventoryId': inventoryId || `INV_${resolvedProductId}`,
        ':productId': resolvedProductId,
        ':currentStock': normalizeNumber(currentStock),
        ':minimumStock': normalizeNumber(minimumStock),
        ':reservedStock': normalizeNumber(reservedStock),
        ':availableStock': availableStock,
        ':unit': unit || null,
        ':status': computedStatus,
        ':isLowStock': indexKeys.isLowStock,
        ':gsi1pk': indexKeys.gsi1pk,
        ':gsi1sk': indexKeys.gsi1sk,
        ':gsi2pk': indexKeys.gsi2pk,
        ':gsi2sk': indexKeys.gsi2sk,
        ':updatedAt': now,
        ':createdAt': createdAt || now,
        ':expectedVersion': normalizeNumber(expectedVersion || 0),
        ':nextVersion': normalizeNumber(expectedVersion || 0) + 1,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return toDomain(result.Attributes || null);
};

const adjustInventoryStock = async ({
  productId,
  foodId,
  currentStockDelta = 0,
  reservedStockDelta = 0,
  expectedVersion,
  eventId = null,
}) => {
  const resolvedProductId = resolveProductId(productId, foodId);
  const current = await loadInventory(resolvedProductId);
  if (!current) return null;

  const nextCurrentStock = normalizeNumber(current.currentStock) + normalizeNumber(currentStockDelta);
  if (nextCurrentStock < 0) {
    const error = new Error(`Insufficient stock for product '${productId}'`);
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  const nextReservedStock = Math.max(
    normalizeNumber(current.reservedStock) + normalizeNumber(reservedStockDelta),
    0
  );
  const nextVersion = normalizeNumber(expectedVersion ?? current.version) + 1;
  const now = new Date().toISOString();
  const computedStatus = computeStatus(nextCurrentStock, current.minimumStock);
  const availableStock = computeAvailability(nextCurrentStock, nextReservedStock);
  const indexKeys = buildIndexKeys(nextCurrentStock, current.minimumStock, resolvedProductId);

  const expressionAttributeNames = { '#version': 'version', '#status': 'status' };
  const expressionAttributeValues = {
    ':currentStock': nextCurrentStock,
    ':reservedStock': nextReservedStock,
    ':availableStock': availableStock,
    ':status': computedStatus,
    ':isLowStock': indexKeys.isLowStock,
    ':gsi1pk': indexKeys.gsi1pk,
    ':gsi1sk': indexKeys.gsi1sk,
    ':gsi2pk': indexKeys.gsi2pk,
    ':gsi2sk': indexKeys.gsi2sk,
    ':updatedAt': now,
    ':expectedVersion': normalizeNumber(current.version),
    ':nextVersion': nextVersion,
  };

  let conditionExpression = 'attribute_exists(pk) AND #version = :expectedVersion';
  let updateExpression =
    'SET currentStock = :currentStock, reservedStock = :reservedStock, availableStock = :availableStock, #status = :status, isLowStock = :isLowStock, gsi1pk = :gsi1pk, gsi1sk = :gsi1sk, gsi2pk = :gsi2pk, gsi2sk = :gsi2sk, updatedAt = :updatedAt, #version = :nextVersion';

  if (eventId) {
    expressionAttributeNames['#processedEventIds'] = 'processedEventIds';
    expressionAttributeValues[':eventId'] = eventId;
    expressionAttributeValues[':emptyList'] = [];
    expressionAttributeValues[':eventMarkerList'] = [eventId];
    conditionExpression +=
      ' AND (attribute_not_exists(#processedEventIds) OR NOT contains(#processedEventIds, :eventId))';
    updateExpression +=
      ', #processedEventIds = list_append(if_not_exists(#processedEventIds, :emptyList), :eventMarkerList)';
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: key(resolvedProductId),
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return toDomain(result.Attributes || null);
};

const deleteInventory = async (productId) => {
  await documentClient.send(new DeleteCommand({ TableName: tableName(), Key: key(productId) }));
  return true;
};

module.exports = {
  tableName,
  findByProductId,
  listAll,
  listLowStockAlerts,
  createInventory,
  updateInventory,
  adjustInventoryStock,
  deleteInventory,
  toDomain,
  computeStatus,
  computeAvailability,
};

module.exports.findByFoodId = findByProductId;
module.exports.createInventoryRepository = () => module.exports;
