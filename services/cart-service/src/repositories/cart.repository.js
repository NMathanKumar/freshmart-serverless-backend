const { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const tableName = () => {
  return config.dynamodb.tables.carts || process.env.DDB_TABLE_CARTS || 'freshmart-dev-carts';
};

const HEADER_PRODUCT_ID = '_HEADER_';

const isConditionalFailure = (error) =>
  error?.name === 'ConditionalCheckFailedException' ||
  error?.Code === 'ConditionalCheckFailedException' ||
  error?.code === 'ConditionalCheckFailedException';

const toCart = (item) => {
  if (!item) return null;
  return {
    cartId: item.cartId || 'default',
    userId: item.userId,
    subtotal: Number(item.subtotal || 0),
    tax: Number(item.tax || 0),
    totalAmount: Number(item.totalAmount || 0),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const toItem = (item) => {
  if (!item || item.productId === HEADER_PRODUCT_ID) return null;
  return {
    cartItemId: item.cartItemId || `${item.userId}_${item.productId}`,
    cartId: item.cartId || 'default',
    userId: item.userId,
    productId: item.productId,
    productName: item.productName || item.name || null,
    imageUrl: item.imageUrl || null,
    available: item.available !== false,
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    lineTotal: Number(item.price || 0) * Number(item.quantity || 1),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findCartByUserId = async (userId) => {
  if (!userId) return null;
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: { userId, productId: HEADER_PRODUCT_ID },
    })
  );
  return toCart(result.Item || null);
};

const findCartById = async (cartId) => {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'cartId = :cartId AND productId = :header',
      ExpressionAttributeValues: { ':cartId': cartId, ':header': HEADER_PRODUCT_ID },
      Limit: 1,
    })
  );
  return toCart(result.Items?.[0] || null);
};

const createCart = async (cartId, userId) => {
  const now = new Date().toISOString();
  const item = {
    userId,
    productId: HEADER_PRODUCT_ID,
    cartId: cartId || 'default',
    subtotal: 0,
    tax: 0,
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
    })
  );

  return toCart(item);
};

const getOrCreateCart = async (cartId, userId) => {
  const existing = await findCartByUserId(userId);
  if (existing) return existing;

  try {
    return await createCart(cartId, userId);
  } catch (error) {
    if (isConditionalFailure(error)) return findCartByUserId(userId);
    throw error;
  }
};

const findItems = async (cartId, userId = null) => {
  if (!userId) {
    const cart = await findCartById(cartId);
    if (!cart) return [];
    userId = cart.userId;
  }

  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': userId },
    })
  );

  return (result.Items || [])
    .filter((item) => item.productId !== HEADER_PRODUCT_ID)
    .map(toItem)
    .filter(Boolean);
};

const findItemsByProductId = async (productId) => {
  const result = await documentClient.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: 'productId = :pid',
      ExpressionAttributeValues: { ':pid': productId },
    })
  );

  return (result.Items || []).map(toItem).filter(Boolean);
};

const findItem = async (cartId, userId, productId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: { userId, productId },
    })
  );
  return toItem(result.Item || null);
};

const putItem = async ({ cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available }) => {
  const now = new Date().toISOString();
  const item = {
    userId,
    productId,
    cartItemId: cartItemId || `${userId}_${productId}`,
    cartId: cartId || 'default',
    quantity: Number(quantity),
    price: Number(price),
    productName: productName || null,
    imageUrl: imageUrl || null,
    available: available !== false,
    createdAt: now,
    updatedAt: now,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
    })
  );

  return toItem(item);
};

const upsertItem = async (
  { cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available },
  _retries = 0
) => {
  const existing = await findItem(cartId, userId, productId);
  const now = new Date().toISOString();

  if (!existing) {
    return await putItem({ cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available });
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { userId, productId },
      UpdateExpression:
        'SET quantity = :quantity, price = :price, productName = :productName, imageUrl = :imageUrl, available = :available, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':quantity': Number(existing.quantity) + Number(quantity),
        ':price': Number(price),
        ':productName': productName || existing.productName || null,
        ':imageUrl': imageUrl || existing.imageUrl || null,
        ':available': available !== false,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return toItem(result.Attributes || null);
};

const setItemQuantity = async (cartId, userId, productId, quantity) => {
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { userId, productId },
      UpdateExpression: 'SET quantity = :quantity, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':quantity': Number(quantity),
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toItem(result.Attributes || null);
};

const updateItemAvailability = async (cartId, userId, productId, available) => {
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { userId, productId },
      UpdateExpression: 'SET available = :available, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':available': available !== false,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toItem(result.Attributes || null);
};

const removeItem = async (cartId, userId, productId) => {
  await documentClient.send(
    new DeleteCommand({
      TableName: tableName(),
      Key: { userId, productId },
    })
  );
  return true;
};

const clearItems = async (cartId, userId = null) => {
  const items = await findItems(cartId, userId);
  for (const item of items) {
    await documentClient.send(
      new DeleteCommand({
        TableName: tableName(),
        Key: { userId: item.userId, productId: item.productId },
      })
    );
  }
};

const updateTotals = async (cartId, userId, { subtotal, tax, totalAmount }) => {
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { userId, productId: HEADER_PRODUCT_ID },
      UpdateExpression:
        'SET subtotal = :subtotal, tax = :tax, totalAmount = :totalAmount, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':subtotal': Number(subtotal),
        ':tax': Number(tax),
        ':totalAmount': Number(totalAmount),
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toCart(result.Attributes || null);
};

module.exports = {
  findCartByUserId,
  findCartById,
  createCart,
  getOrCreateCart,
  findItems,
  findItemsByProductId,
  findItemsByFoodId: findItemsByProductId,
  findItem,
  upsertItem,
  putItem,
  setItemQuantity,
  updateItemAvailability,
  removeItem,
  clearItems,
  updateTotals,
};
