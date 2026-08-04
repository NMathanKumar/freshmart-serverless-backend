const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.products) => {
  return tableName || process.env.DDB_TABLE_PRODUCTS || 'freshmart-dev-products';
};

// The deployed freshmart-dev-products table uses a simple key: { productId: String }
// with GSIs: category-index (hash: category), brand-index (hash: brand), status-index (hash: status)

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toDomain = (item) => {
  if (!item) return null;
  return {
    productId: item.productId,
    productName: item.productName,
    description: item.description || null,
    category: item.category,
    brand: item.brand || null,
    price: Number(item.price),
    images: Array.isArray(item.images) ? item.images : [],
    available: item.available !== false,
    weight: item.weight ? Number(item.weight) : null,
    unit: item.unit || null,
    stock: Number(item.stock ?? 0),
    status: item.status || 'active',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: Number(item.version || 0),
  };
};

const createProductRepository = ({ client = documentClient, tableName = null, now = () => new Date() } = {}) => {
  const resolveTableName = () => getTableName(tableName);

  const findById = async (productId) => {
    const result = await client.send(
      new GetCommand({ TableName: resolveTableName(), Key: { productId } })
    );
    return toDomain(result.Item || null);
  };

  const findAll = async ({ limit = 20, cursor, category } = {}) => {
    if (category) {
      // Use category-index GSI (hash key: 'category')
      const params = {
        TableName: resolveTableName(),
        IndexName: 'category-index',
        KeyConditionExpression: 'category = :cat',
        ExpressionAttributeValues: { ':cat': category },
        Limit: Number(limit),
      };
      if (cursor) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      }
      const result = await client.send(new QueryCommand(params));
      return {
        items: (result.Items || []).map(toDomain).filter(Boolean),
        nextCursor: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64url')
          : null,
      };
    } else {
      // Scan all products
      const params = {
        TableName: resolveTableName(),
        Limit: Number(limit),
      };
      if (cursor) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      }
      const result = await client.send(new ScanCommand(params));
      return {
        items: (result.Items || []).map(toDomain).filter(Boolean),
        nextCursor: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64url')
          : null,
      };
    }
  };

  const search = async (term, { limit = 20, cursor } = {}) => {
    if (!term || !term.trim()) return { items: [], nextCursor: null };
    const normalizedTerm = normalizeText(term);
    // Use Scan with contains filter on nameNormalized since no full-text search index exists
    const params = {
      TableName: resolveTableName(),
      FilterExpression: 'contains(nameNormalized, :term) OR contains(productName, :rawTerm)',
      ExpressionAttributeValues: {
        ':term': normalizedTerm,
        ':rawTerm': term,
      },
      Limit: Number(limit),
    };
    if (cursor) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    }
    const result = await client.send(new ScanCommand(params));
    return {
      items: (result.Items || []).map(toDomain).filter(Boolean).slice(0, Number(limit)),
      nextCursor: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64url')
        : null,
    };
  };

  const createProduct = async (productId, data) => {
    const timestamp = now().toISOString();
    const normalizedName = normalizeText(data.productName || '');
    const item = {
      productId,
      productName: data.productName,
      description: data.description || null,
      category: data.category,
      brand: data.brand || null,
      price: Number(data.price),
      images: Array.isArray(data.images) ? data.images : [],
      available: data.available !== false,
      weight: data.weight ? Number(data.weight) : null,
      unit: data.unit || null,
      stock: Number(data.stock ?? 0),
      status: data.status || 'active',
      nameNormalized: normalizedName,
      version: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await client.send(
      new PutCommand({
        TableName: resolveTableName(),
        Item: item,
        ConditionExpression: 'attribute_not_exists(productId)',
      })
    );
    return toDomain(item);
  };

  const updateProduct = async (productId, data) => {
    const existing = await findById(productId);
    if (!existing) return null;

    const timestamp = now().toISOString();
    const merged = { ...existing, ...data };
    const normalizedName = normalizeText(merged.productName || '');
    const nextVersion = Number(existing.version || 0) + 1;

    const item = {
      productId,
      productName: merged.productName,
      description: merged.description || null,
      category: merged.category,
      brand: merged.brand || null,
      price: Number(merged.price),
      images: Array.isArray(merged.images) ? merged.images : [],
      available: merged.available !== false,
      weight: merged.weight ? Number(merged.weight) : null,
      unit: merged.unit || null,
      stock: Number(merged.stock ?? 0),
      status: merged.status || 'active',
      nameNormalized: normalizedName,
      version: nextVersion,
      createdAt: existing.createdAt,
      updatedAt: timestamp,
    };
    await client.send(
      new PutCommand({
        TableName: resolveTableName(),
        Item: item,
        ConditionExpression: '#version = :currentVersion',
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: { ':currentVersion': Number(existing.version || 0) },
      })
    );
    return toDomain(item);
  };

  const setAvailability = async (productId, available) => {
    const timestamp = now().toISOString();
    const result = await client.send(
      new UpdateCommand({
        TableName: resolveTableName(),
        Key: { productId },
        UpdateExpression: 'SET available = :available, updatedAt = :updatedAt, #version = #version + :inc',
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: {
          ':available': !!available,
          ':updatedAt': timestamp,
          ':inc': 1,
        },
        ConditionExpression: 'attribute_exists(productId)',
        ReturnValues: 'ALL_NEW',
      })
    );
    return toDomain(result.Attributes || null);
  };

  const remove = async (productId) => {
    const result = await client.send(
      new DeleteCommand({
        TableName: resolveTableName(),
        Key: { productId },
        ReturnValues: 'ALL_OLD',
      })
    );
    return !!result.Attributes;
  };

  return {
    createProduct,
    findById,
    findAll,
    search,
    updateProduct,
    setAvailability,
    remove,
  };
};

module.exports = createProductRepository;
