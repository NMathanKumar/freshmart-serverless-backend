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
    customerName: item.customerName || item.deliveryAddressData?.name || null,
    customerEmail: item.customerEmail || item.deliveryAddressData?.email || null,
    items: Array.isArray(item.items) ? item.items : [],
    subtotal: normalizeNumber(item.subtotal),
    tax: normalizeNumber(item.tax),
    discount: normalizeNumber(item.discount),
    totalAmount: normalizeNumber(item.totalAmount || item.grandTotal),
    paymentStatus: item.paymentStatus || (item.paymentMethod && item.paymentMethod.toUpperCase() !== 'COD' ? 'SUCCESS' : 'PENDING'),
    paymentId: item.paymentId || (item.orderId ? `PAY_${String(item.orderId).replace(/^#?ORDER_?/, '')}` : null),
    paymentMethod: item.paymentMethod || 'CARD',
    deliveryAddress: item.deliveryAddress || 'Home',
    deliveryAddressData: item.deliveryAddressData || null,
    orderStatus: item.orderStatus || item.status || 'PLACED',
    pickupTime: item.pickupTime || null,
    createdAt: item.createdAt || item.createdDate,
    updatedAt: item.updatedAt || item.createdDate,
    version: normalizeNumber(item.version),
  };
};

const findById = async (orderId) => {
  if (!orderId) return null;
  const cleanId = String(orderId).replace(/^#/, '');
  const hashedId = `#${cleanId}`;

  // Try direct GetCommand key lookups first
  for (const keyToTry of [{ orderId }, { orderId: cleanId }, { orderId: hashedId }, { pk: `ORDER#${cleanId}`, sk: 'META' }]) {
    try {
      const result = await documentClient.send(
        new GetCommand({
          TableName: tableName(),
          Key: keyToTry,
        })
      );
      if (result.Item) return toDomain(result.Item);
    } catch (_err) {
      // Continue to next lookup attempt
    }
  }

  // Fallback to Scan if Key lookup didn't find the item
  try {
    const scanResult = await documentClient.send(
      new ScanCommand({
        TableName: tableName(),
        FilterExpression: 'orderId = :id1 OR orderId = :id2 OR orderId = :id3',
        ExpressionAttributeValues: {
          ':id1': orderId,
          ':id2': cleanId,
          ':id3': hashedId,
        },
      })
    );
    if (scanResult.Items && scanResult.Items.length > 0) {
      return toDomain(scanResult.Items[0]);
    }
  } catch (_scanErr) {
    // Return null if scan fails
  }

  return null;
};

const create = async ({
  orderId,
  userId,
  customerEmail = null,
  customerName = null,
  items = [],
  subtotal,
  tax,
  discount = 0,
  totalAmount,
  paymentStatus = 'PENDING',
  paymentId = null,
  paymentMethod = 'CARD',
  deliveryAddress = 'Home',
  deliveryAddressData = null,
  orderStatus = 'PLACED',
  pickupTime,
}) => {
  const now = new Date().toISOString();
  const item = {
    orderId,
    userId,
    customerId: userId,
    customerEmail: customerEmail || deliveryAddressData?.email || null,
    customerName: customerName || deliveryAddressData?.name || null,
    createdDate: now,
    status: orderStatus,
    items,
    subtotal: normalizeNumber(subtotal),
    tax: normalizeNumber(tax),
    discount: normalizeNumber(discount),
    totalAmount: normalizeNumber(totalAmount),
    paymentStatus,
    paymentId: paymentId || null,
    paymentMethod,
    deliveryAddress,
    deliveryAddressData: deliveryAddressData || null,
    orderStatus,
    pickupTime: pickupTime || null,
    createdAt: now,
    updatedAt: now,
    version: 0,
    pk: `ORDER#${orderId}`,
    sk: 'META',
    gsi1pk: `USER#${userId}`,
    gsi1sk: `ORDER#${now}`,
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
  const nextVersion = Number(current.version || 0) + 1;
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { orderId },
      UpdateExpression:
        'SET orderStatus = :orderStatus, #st = :orderStatus, updatedAt = :updatedAt, #version = :nextVersion',
      ExpressionAttributeNames: {
        '#version': 'version',
        '#st': 'status',
      },
      ExpressionAttributeValues: {
        ':orderStatus': orderStatus,
        ':updatedAt': now,
        ':nextVersion': nextVersion,
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toDomain(result.Attributes || null);
};

const updatePaymentStatus = async (orderId, paymentStatus, paymentId = null) => {
  const current = await findById(orderId);
  if (!current) return null;

  const updateExpr = paymentId
    ? 'SET paymentStatus = :paymentStatus, paymentId = :paymentId, updatedAt = :updatedAt, #version = :nextVersion'
    : 'SET paymentStatus = :paymentStatus, updatedAt = :updatedAt, #version = :nextVersion';

  const exprAttrValues = {
    ':paymentStatus': paymentStatus,
    ':updatedAt': new Date().toISOString(),
    ':expectedVersion': Number(current.version || 0),
    ':nextVersion': Number(current.version || 0) + 1,
  };

  if (paymentId) {
    exprAttrValues[':paymentId'] = paymentId;
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { orderId },
      UpdateExpression: updateExpr,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#version': 'version',
      },
      ExpressionAttributeValues: exprAttrValues,
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
