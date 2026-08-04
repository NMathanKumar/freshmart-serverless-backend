const { genId } = require('@freshmart/service-shared').utils.id;
const { NotFoundError, BadRequestError } = require('@freshmart/service-shared').errors;
const { GetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const sharedLogger = require('@freshmart/service-shared').logger;
const orderRepository = require('../repositories/order.repository');

const logger = sharedLogger.child({ service: 'fulfillment-service' });

const tableName = () => {
  return config.dynamodb.tables.orders || process.env.DDB_TABLE_ORDERS || 'freshmart-dev-orders';
};

const FULFILLMENT_STATUSES = [
  'NEW',
  'ALLOCATED',
  'PICKING',
  'PICKED',
  'PACKING',
  'PACKED',
  'QUALITY_CHECK',
  'READY_FOR_DISPATCH',
  'DISPATCHED',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
  'RETURNED'
];

const createFulfillment = async (orderId, warehouseId, priority = 'NORMAL') => {
  const fulfillmentId = genId('FULFILL');
  const now = new Date().toISOString();
  
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new NotFoundError(`Order '${orderId}' not found`);
  }

  const status = 'NEW';
  
  const item = {
    pk: `ORDER#${orderId}`,
    sk: `FULFILLMENT#${fulfillmentId}`,
    gsi1pk: `WAREHOUSE#${warehouseId}`,
    gsi1sk: `STATUS#${status}`,
    gsi2pk: `FULFILLMENT#${fulfillmentId}`,
    gsi2sk: `META`,
    fulfillmentId,
    orderId,
    warehouseId,
    status,
    priority,
    pickListId: null,
    shipmentId: null,
    allocatedAt: null,
    packedAt: null,
    dispatchedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    version: 0,
    entityType: 'FULFILLMENT',
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

const getFulfillment = async (fulfillmentId) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi2',
      KeyConditionExpression: 'gsi2pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `FULFILLMENT#${fulfillmentId}`,
      },
    })
  );

  if (!result.Items || result.Items.length === 0) {
    throw new NotFoundError(`Fulfillment '${fulfillmentId}' not found`);
  }
  return result.Items[0];
};

const allocateOrder = async (fulfillmentId) => {
  const fulfillment = await getFulfillment(fulfillmentId);
  if (fulfillment.status !== 'NEW') {
    throw new BadRequestError(`Cannot allocate order in status ${fulfillment.status}`);
  }

  const order = await orderRepository.findById(fulfillment.orderId);
  if (!order) {
    throw new NotFoundError(`Order '${fulfillment.orderId}' not found`);
  }

  // HTTP call to inventory service
  const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002/v1/inventory';
  const token = process.env.SYSTEM_TOKEN || 'system-token';

  // Reserve stock for all items
  for (const item of order.items) {
    const response = await fetch(`${inventoryUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: item.productId,
        warehouseId: fulfillment.warehouseId,
        quantity: item.quantity,
        orderId: fulfillment.orderId
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      logger.error('Failed to reserve stock', { error: errorBody });
      await updateFulfillmentStatus(fulfillmentId, 'FAILED');
      throw new BadRequestError(`Failed to reserve stock for product ${item.productId}`);
    }
  }

  return updateFulfillmentStatus(fulfillmentId, 'ALLOCATED');
};

const updateFulfillmentStatus = async (fulfillmentId, newStatus) => {
  if (!FULFILLMENT_STATUSES.includes(newStatus)) {
    throw new BadRequestError(`Invalid status: ${newStatus}`);
  }

  const fulfillment = await getFulfillment(fulfillmentId);
  const now = new Date().toISOString();

  let additionalUpdates = '';
  let additionalValues = {};

  if (newStatus === 'ALLOCATED') {
    additionalUpdates = ', allocatedAt = :now';
    additionalValues[':now'] = now;
  } else if (newStatus === 'PACKED') {
    additionalUpdates = ', packedAt = :now';
    additionalValues[':now'] = now;
  } else if (newStatus === 'DISPATCHED') {
    additionalUpdates = ', dispatchedAt = :now';
    additionalValues[':now'] = now;
  } else if (newStatus === 'DELIVERED') {
    additionalUpdates = ', completedAt = :now';
    additionalValues[':now'] = now;
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: fulfillment.pk, sk: fulfillment.sk },
      UpdateExpression: `SET #status = :status, gsi1sk = :gsi1sk, updatedAt = :updatedAt ${additionalUpdates}`,
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':gsi1sk': `STATUS#${newStatus}`,
        ':updatedAt': now,
        ...additionalValues,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes;
};

const listFulfillments = async (warehouseId, status) => {
  if (!warehouseId) {
    throw new BadRequestError('warehouseId is required');
  }

  let keyCondition = 'gsi1pk = :warehouseId';
  let values = {
    ':warehouseId': `WAREHOUSE#${warehouseId}`,
  };

  if (status) {
    keyCondition += ' AND gsi1sk = :status';
    values[':status'] = `STATUS#${status}`;
  }

  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi1',
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: values,
    })
  );

  return result.Items || [];
};

module.exports = {
  createFulfillment,
  allocateOrder,
  updateFulfillmentStatus,
  getFulfillment,
  listFulfillments,
};
