const { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

const tableName = () => {
  const name = config.dynamodb.tables.orders;
  if (!name) throw new Error('Missing DDB_TABLE_ORDERS');
  return name;
};

const key = (orderId) => ({
  pk: `ORDER#${orderId}`,
  sk: 'META',
});

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    orderId: item.orderId,
    userId: item.userId,
    items: Array.isArray(item.items) ? item.items : [],
    subtotal: normalizeNumber(item.subtotal),
    tax: normalizeNumber(item.tax),
    discount: normalizeNumber(item.discount),
    totalAmount: normalizeNumber(item.totalAmount),
    paymentStatus: item.paymentStatus,
    orderStatus: item.orderStatus,
    pickupTime: item.pickupTime || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: normalizeNumber(item.version),
  };
};

const findById = async (orderId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: key(orderId),
    })
  );
  return toDomain(result.Item || null);
};

const create = async ({
  orderId,
  userId,
  items = [],
  subtotal,
  tax,
  discount = 0,
  totalAmount,
  paymentStatus,
  orderStatus,
  pickupTime,
}) => {
  const now = new Date().toISOString();
  const item = {
    ...key(orderId),
    orderId,
    userId,
    items,
    subtotal: normalizeNumber(subtotal),
    tax: normalizeNumber(tax),
    discount: normalizeNumber(discount),
    totalAmount: normalizeNumber(totalAmount),
    paymentStatus,
    orderStatus,
    pickupTime: pickupTime || null,
    createdAt: now,
    updatedAt: now,
    version: 0,
    gsi1pk: `USER#${userId}`,
    gsi1sk: `CREATED#${now}`,
    gsi2pk: `STATUS#${orderStatus}`,
    gsi2sk: `CREATED#${now}`,
    entityType: 'ORDER',
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

const findByUser = async (userId, { page = 1, limit = 20, orderStatus } = {}) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
      ScanIndexForward: false,
    })
  );

  let items = (result.Items || []).map(toDomain);
  if (orderStatus) {
    items = items.filter((item) => item.orderStatus === orderStatus);
  }

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
  };
};

const findAllAdmin = async ({ page = 1, limit = 20, orderStatus } = {}) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsi2',
      KeyConditionExpression: 'gsi2pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `STATUS#${orderStatus || 'PLACED'}`,
      },
      ScanIndexForward: false,
    })
  );

  const items = (result.Items || []).map(toDomain);
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
  };
};

const updateOrderStatus = async (orderId, orderStatus) => {
  const current = await findById(orderId);
  if (!current) return null;

  const now = new Date().toISOString();
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: key(orderId),
      UpdateExpression:
        'SET orderStatus = :orderStatus, gsi2pk = :gsi2pk, gsi2sk = :gsi2sk, updatedAt = :updatedAt, #version = :nextVersion',
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#version': 'version',
      },
      ExpressionAttributeValues: {
        ':orderStatus': orderStatus,
        ':gsi2pk': `STATUS#${orderStatus}`,
        ':gsi2sk': `CREATED#${current.createdAt}`,
        ':updatedAt': now,
        ':expectedVersion': Number(current.version || 0),
        ':nextVersion': Number(current.version || 0) + 1,
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toDomain(result.Attributes || null);
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
  const current = await findById(orderId);
  if (!current) return null;

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: key(orderId),
      UpdateExpression: 'SET paymentStatus = :paymentStatus, updatedAt = :updatedAt, #version = :nextVersion',
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#version': 'version',
      },
      ExpressionAttributeValues: {
        ':paymentStatus': paymentStatus,
        ':updatedAt': new Date().toISOString(),
        ':expectedVersion': Number(current.version || 0),
        ':nextVersion': Number(current.version || 0) + 1,
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toDomain(result.Attributes || null);
};

const deleteOrder = async (orderId) => {
  await documentClient.send(
    new DeleteCommand({
      TableName: tableName(),
      Key: key(orderId),
    })
  );
  return true;
};

module.exports = {
  tableName,
  findById,
  create,
  findByUser,
  findAllAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
};

module.exports.createOrderRepository = () => module.exports;
