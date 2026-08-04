const {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const { genId } = require('@freshmart/service-shared').utils.id;

const tableName = () => {
  return config.dynamodb.tables.inventory || process.env.DDB_TABLE_INVENTORY || 'freshmart-dev-inventory';
};

const key = (transferId) => ({
  pk: `TRANSFER#${transferId}`,
  sk: 'METADATA',
});

const inventoryKey = (productId) => ({
  pk: `PRODUCT#${productId}`,
  sk: 'INVENTORY',
});

const movementKey = (productId, timestamp, uuid) => ({
  pk: `PRODUCT#${productId}`,
  sk: `MOVEMENT#${timestamp}#${uuid}`,
});

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const createTransfer = async (data) => {
  const now = new Date().toISOString();
  const id = genId('TRF');
  
  // Need a sequence generator for transferNumber. For now, use ID.
  const transferNumber = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const item = {
    ...key(id),
    ...data,
    id,
    transferNumber,
    status: 'DRAFT',
    approvalStatus: 'PENDING',
    createdAt: now,
    updatedAt: now,
    statusHistory: [{
      status: 'DRAFT',
      changedBy: data.requestedBy || 'SYSTEM',
      changedAt: now,
      remarks: 'Transfer created'
    }],
    totalItems: data.items.length,
    totalQuantity: data.items.reduce((sum, it) => sum + normalizeNumber(it.requestedQty), 0),
    version: 0,
    // Add GSI attributes
    gsi1pk: data.sourceWarehouseId,
    gsi1sk: now,
    gsi2pk: data.destinationWarehouseId,
    gsi2sk: now,
    gsi3pk: 'DRAFT',
    gsi3sk: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk)',
    })
  );

  return item;
};

const getTransfer = async (id) => {
  const res = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: key(id),
    })
  );
  return res.Item || null;
};

const saveTransfer = async (id, updatedData, expectedVersion) => {
  const now = new Date().toISOString();
  const nextVersion = normalizeNumber(expectedVersion) + 1;
  
  const item = {
    ...key(id),
    ...updatedData,
    updatedAt: now,
    version: nextVersion,
    // ensure GSIs are updated if status changes
    gsi1pk: updatedData.sourceWarehouseId,
    gsi1sk: updatedData.createdAt || now,
    gsi2pk: updatedData.destinationWarehouseId,
    gsi2sk: updatedData.createdAt || now,
    gsi3pk: updatedData.status,
    gsi3sk: updatedData.createdAt || now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':expectedVersion': normalizeNumber(expectedVersion) },
    })
  );

  return item;
};

const listTransfers = async ({ page = 1, limit = 20, sourceWarehouseId, destinationWarehouseId, status } = {}) => {
  let command;
  if (sourceWarehouseId) {
    command = new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :val',
      ExpressionAttributeValues: { ':val': sourceWarehouseId },
      ScanIndexForward: false,
    });
  } else if (destinationWarehouseId) {
    command = new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi2',
      KeyConditionExpression: 'gsi2pk = :val',
      ExpressionAttributeValues: { ':val': destinationWarehouseId },
      ScanIndexForward: false,
    });
  } else if (status) {
    command = new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi3',
      KeyConditionExpression: 'gsi3pk = :val',
      ExpressionAttributeValues: { ':val': status },
      ScanIndexForward: false,
    });
  } else {
    // Note: Since this table also has products, scanning for TRANSFER# is required.
    command = new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'begins_with(pk, :val)',
      ExpressionAttributeValues: { ':val': 'TRANSFER#' },
    });
  }

  const result = await documentClient.send(command);
  let items = (result.Items || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter remaining if we used a GSI but had multiple criteria
  if (sourceWarehouseId && destinationWarehouseId) {
    items = items.filter(i => i.destinationWarehouseId === destinationWarehouseId);
  }
  if (status && (sourceWarehouseId || destinationWarehouseId)) {
    items = items.filter(i => i.status === status);
  }

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

/**
 * Execute a transaction block
 * @param {Array} transactItems 
 */
const executeTransaction = async (transactItems) => {
  // DynamoDB TransactWriteItems supports up to 100 items.
  // We need to chunk if > 100, but for our case, transfers likely have < 30 items.
  if (transactItems.length > 100) {
    throw new Error('Too many items for a single DynamoDB transaction');
  }

  await documentClient.send(
    new TransactWriteCommand({
      TransactItems: transactItems,
    })
  );
};

module.exports = {
  createTransfer,
  getTransfer,
  saveTransfer,
  listTransfers,
  executeTransaction,
  inventoryKey,
  movementKey,
  tableName,
};
