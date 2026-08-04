const { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const tableName = () => {
  return config.dynamodb.tables.orders || process.env.DDB_TABLE_ORDERS || 'freshmart-dev-orders';
};

const key = (orderId) => ({
  orderId,
});

const normalizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    orderId: item.orderId,
    userId: item.userId || item.customerId,
    customerId: item.customerId || item.userId,
    items: Array.isArray(item.items) ? item.items : [],
    subtotal: normalizeNumber(item.subtotal),
    tax: normalizeNumber(item.tax),
    discount: normalizeNumber(item.discount),
    totalAmount: normalizeNumber(item.totalAmount || item.grandTotal),
    paymentStatus: item.paymentStatus || 'PENDING',
    orderStatus: item.orderStatus || item.status || 'PLACED',
    pickupTime: item.pickupTime || null,
    createdAt: item.createdAt || item.createdDate,
    updatedAt: item.updatedAt || item.createdDate,
    version: normalizeNumber(item.version),
  };
};

const findById = async (orderId) => {
  let item = null;
  try {
    const result = await documentClient.send(
      new GetCommand({
        TableName: tableName(),
        Key: { orderId },
      })
    );
    item = result.Item;
  } catch (err) {
    try {
      const result = await documentClient.send(
        new GetCommand({
          TableName: tableName(),
          Key: { pk: `ORDER#${orderId}`, sk: 'META' },
        })
      );
      item = result.Item;
    } catch (_err2) {
      item = null;
    }
  }
  return toDomain(item || null);
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
    orderId,
    userId,
    customerId: userId,
    createdDate: now,
    status: orderStatus,
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
    pk: `ORDER#${orderId}`,
    sk: 'META',
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
      ConditionExpression: 'attribute_not_exists(orderId)',
    })
  );

  return toDomain(item);
};

const findByUser = async (userId, { page = 1, limit = 20, orderStatus } = {}) => {
  let rawItems = [];
  try {
    const result = await documentClient.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: 'customer-index',
        KeyConditionExpression: 'customerId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false,
      })
    );
    rawItems = result.Items || [];
  } catch (_err1) {
    try {
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
      rawItems = result.Items || [];
    } catch (_err2) {
      try {
        const result = await documentClient.send(
          new ScanCommand({
            TableName: tableName(),
            FilterExpression: 'userId = :userId OR customerId = :userId OR gsi1pk = :pk',
            ExpressionAttributeValues: {
              ':userId': userId,
              ':pk': `USER#${userId}`,
            },
          })
        );
        rawItems = result.Items || [];
      } catch (_err3) {
        rawItems = [];
      }
    }
  }

  let items = rawItems.map(toDomain);
  if (orderStatus) {
    items = items.filter((item) => item.orderStatus === orderStatus);
  }

  const safePage = Number(page) > 1 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
  };
};

const findAllAdmin = async ({ page = 1, limit = 20, orderStatus } = {}) => {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
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
      Key: { orderId },
      UpdateExpression:
        'SET orderStatus = :orderStatus, #st = :orderStatus, gsi2pk = :gsi2pk, gsi2sk = :gsi2sk, updatedAt = :updatedAt, #version = :nextVersion',
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#version': 'version',
        '#st': 'status',
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
      Key: { orderId },
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
      Key: { orderId },
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
