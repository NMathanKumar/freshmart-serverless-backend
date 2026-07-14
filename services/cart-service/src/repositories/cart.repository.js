const { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const tableName = () => {
  const name = config.dynamodb.tables.carts;
  if (!name) throw new Error('Missing DDB_TABLE_CARTS');
  return name;
};

const cartPk = (userId) => `USER#${userId}`;
const cartSk = (cartId) => `CART#${cartId}`;
const itemSk = (cartId, productId) => `ITEM#${productId}`;
const cartGsiPk = (cartId) => `CART#${cartId}`;
const cartGsiSk = (productId) => `ITEM#${productId}`;
const productGsiPk = (productId) => `PRODUCT#${productId}`;
const productGsiSk = (userId, cartId) => `USER#${userId}#CART#${cartId}`;

const isConditionalFailure = (error) =>
  error?.name === 'ConditionalCheckFailedException' ||
  error?.Code === 'ConditionalCheckFailedException' ||
  error?.code === 'ConditionalCheckFailedException';

const toCart = (item) => {
  if (!item) return null;
  return {
    cartId: item.cartId,
    userId: item.userId,
    subtotal: Number(item.subtotal || 0),
    tax: Number(item.tax || 0),
    totalAmount: Number(item.totalAmount || 0),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const toItem = (item) => {
  if (!item) return null;
  return {
    cartItemId: item.cartItemId,
    cartId: item.cartId,
    userId: item.userId,
    productId: item.productId,
    productName: item.productName || item.name || null,
    imageUrl: item.imageUrl || null,
    available: !!item.available,
    quantity: Number(item.quantity),
    price: Number(item.price),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findCartByUserId = async (userId) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': cartPk(userId), ':sk': 'CART#' },
      Limit: 1,
    })
  );
  return toCart(result.Items?.[0] || null);
};

const findCartById = async (cartId) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsiCart',
      KeyConditionExpression: 'gsiCartPk = :pk AND begins_with(gsiCartSk, :sk)',
      ExpressionAttributeValues: { ':pk': cartGsiPk(cartId), ':sk': 'ROOT' },
      Limit: 1,
    })
  );
  return toCart(result.Items?.[0] || null);
};

const createCart = async (cartId, userId) => {
  const now = new Date().toISOString();
  const item = {
    pk: cartPk(userId),
    sk: cartSk(cartId),
    cartId,
    userId,
    subtotal: 0,
    tax: 0,
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
    gsiCartPk: cartGsiPk(cartId),
    gsiCartSk: 'ROOT',
    entityType: 'CART',
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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
  const cart = userId ? await findCartByUserId(userId) : await findCartById(cartId);
  if (!cart) return [];

  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsiCart',
      KeyConditionExpression: 'gsiCartPk = :pk AND begins_with(gsiCartSk, :sk)',
      ExpressionAttributeValues: { ':pk': cartGsiPk(cart.cartId), ':sk': 'ITEM#' },
    })
  );

  return (result.Items || []).map((item) => ({
    cartItemId: item.cartItemId,
    cartId: item.cartId,
    userId: item.userId,
    productId: item.productId,
    productName: item.productName || item.name || null,
    imageUrl: item.imageUrl || null,
    available: !!item.available,
    quantity: Number(item.quantity),
    price: Number(item.price),
    lineTotal: Number(item.price) * Number(item.quantity),
  }));
};

const findItemsByProductId = async (productId) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: 'gsiProduct',
      KeyConditionExpression: 'gsiProductPk = :pk',
      ExpressionAttributeValues: { ':pk': productGsiPk(productId) },
    })
  );

  return (result.Items || []).map((item) => ({
    cartItemId: item.cartItemId,
    cartId: item.cartId,
    userId: item.userId,
    productId: item.productId,
    productName: item.productName || item.name || null,
    imageUrl: item.imageUrl || null,
    available: !!item.available,
    quantity: Number(item.quantity),
    price: Number(item.price),
    lineTotal: Number(item.price) * Number(item.quantity),
  }));
};

const findItem = async (cartId, userId, productId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: cartPk(userId), sk: itemSk(cartId, productId) },
    })
  );
  return toItem(result.Item || null);
};

const putItem = async ({ cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available }) => {
  const now = new Date().toISOString();
  const item = {
    pk: cartPk(userId),
    sk: itemSk(cartId, productId),
    cartItemId,
    cartId,
    userId,
    productId,
    quantity: Number(quantity),
    price: Number(price),
    productName: productName || null,
    imageUrl: imageUrl || null,
    available: !!available,
    createdAt: now,
    updatedAt: now,
    gsiCartPk: cartGsiPk(cartId),
    gsiCartSk: cartGsiSk(productId),
    gsiProductPk: productGsiPk(productId),
    gsiProductSk: productGsiSk(userId, cartId),
    entityType: 'CART_ITEM',
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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
    try {
      return await putItem({ cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available });
    } catch (error) {
      if (isConditionalFailure(error) && _retries < 3) {
        return upsertItem(
          { cartItemId, cartId, userId, productId, quantity, price, productName, imageUrl, available },
          _retries + 1
        );
      }
      throw error;
    }
  }

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: cartPk(userId), sk: itemSk(cartId, productId) },
      UpdateExpression:
        'SET quantity = :quantity, price = :price, productName = :productName, imageUrl = :imageUrl, available = :available, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':quantity': Number(existing.quantity) + Number(quantity),
        ':price': Number(price),
        ':productName': productName || existing.productName || null,
        ':imageUrl': imageUrl || existing.imageUrl || null,
        ':available': !!available,
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
      Key: { pk: cartPk(userId), sk: itemSk(cartId, productId) },
      UpdateExpression: 'SET quantity = :quantity, updatedAt = :updatedAt',
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
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
      Key: { pk: cartPk(userId), sk: itemSk(cartId, productId) },
      UpdateExpression: 'SET available = :available, updatedAt = :updatedAt',
      ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
      ExpressionAttributeValues: {
        ':available': !!available,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return toItem(result.Attributes || null);
};

const removeItem = async (cartId, userId, productId) => {
  const existing = await findItem(cartId, userId, productId);
  if (!existing) return false;

  await documentClient.send(
    new DeleteCommand({
      TableName: tableName(),
      Key: { pk: cartPk(userId), sk: itemSk(cartId, productId) },
    })
  );
  return true;
};

const clearItems = async (cartId, userId = null) => {
  const items = await findItems(cartId, userId);
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await documentClient.send(
      new DeleteCommand({
        TableName: tableName(),
        Key: { pk: cartPk(item.userId), sk: itemSk(item.cartId, item.productId) },
      })
    );
  }
};

const updateTotals = async (cartId, userId, { subtotal, tax, totalAmount }) => {
  const cart = userId ? await findCartByUserId(userId) : await findCartById(cartId);
  if (!cart) return null;

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: cartPk(cart.userId), sk: cartSk(cart.cartId) },
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
