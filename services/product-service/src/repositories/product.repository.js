const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

const TABLE_NAME = (() => {
  const name = config.dynamodb.tables.products;
  if (!name) throw new Error('Missing DDB_TABLE_PRODUCTS');
  return name;
})();

const MAIN_SK = 'META';
const LIST_SK = 'LIST';
const MAX_TRANSACT_ITEMS = 100;

const tokenSk = (token) => `TOKEN#${token}`;
const key = (productId, sk = MAIN_SK) => ({ PK: `PRODUCT#${productId}`, SK: sk });

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) => [...new Set(normalizeText(value).split(' ').filter(Boolean))];

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
    available: !!item.available,
    weight: item.weight ? Number(item.weight) : null,
    unit: item.unit || null,
    stock: Number(item.stock ?? 0),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: Number(item.version || 0),
  };
};

const buildMainItem = ({ productId, data, now, version = 0, createdAt }) => {
  const normalizedName = normalizeText(data.productName);
  const normalizedCategory = normalizeText(data.category);
  const searchTokens = tokenize(data.productName).slice(0, MAX_TRANSACT_ITEMS - 5);
  return {
    ...key(productId),
    productId,
    productName: data.productName,
    description: data.description || null,
    category: data.category,
    brand: data.brand || null,
    price: Number(data.price),
    images: Array.isArray(data.images) ? data.images : [],
    available: data.available ?? true,
    weight: data.weight ? Number(data.weight) : null,
    unit: data.unit || null,
    stock: Number(data.stock ?? 0),
    nameNormalized: normalizedName,
    searchTokens,
    version,
    CategoryPK: `CATEGORY#${normalizedCategory}`,
    CategorySK: `CREATED#${createdAt || now}#PRODUCT#${productId}`,
    AvailabilityPK: `NAME#${normalizedName}`,
    AvailabilitySK: `PRODUCT#${productId}`,
    createdAt: createdAt || now,
    updatedAt: now,
    entityType: 'PRODUCT',
  };
};

const buildListItem = (mainItem) => ({
  ...key(mainItem.productId, LIST_SK),
  ...mainItem,
  SK: LIST_SK,
  CategoryPK: 'CATEGORY#ALL',
  CategorySK: `CREATED#${mainItem.createdAt}#PRODUCT#${mainItem.productId}`,
  entityType: 'PRODUCT_LIST_INDEX',
});

const buildTokenItem = (mainItem, token) => ({
  ...key(mainItem.productId, tokenSk(token)),
  ...mainItem,
  SK: tokenSk(token),
  searchToken: token,
  AvailabilityPK: `NAME#${token}`,
  AvailabilitySK: `PRODUCT#${mainItem.productId}`,
  entityType: 'PRODUCT_SEARCH_INDEX',
});

const buildUpdateParams = (item, currentVersion) => ({
  TableName: TABLE_NAME,
  Key: { PK: item.PK, SK: item.SK },
  UpdateExpression: `
    SET #productName = :productName,
        #description = :description,
        #category = :category,
        #brand = :brand,
        #price = :price,
        #images = :images,
        #available = :available,
        #weight = :weight,
        #unit = :unit,
        #stock = :stock,
        #nameNormalized = :nameNormalized,
        #searchTokens = :searchTokens,
        #CategoryPK = :CategoryPK,
        #CategorySK = :CategorySK,
        #AvailabilityPK = :AvailabilityPK,
        #AvailabilitySK = :AvailabilitySK,
        #updatedAt = :updatedAt,
        #version = :nextVersion,
        #entityType = :entityType
  `,
  ConditionExpression: currentVersion !== undefined ? '#version = :version' : undefined,
  ExpressionAttributeNames: {
    '#productName': 'productName',
    '#description': 'description',
    '#category': 'category',
    '#brand': 'brand',
    '#price': 'price',
    '#images': 'images',
    '#available': 'available',
    '#weight': 'weight',
    '#unit': 'unit',
    '#stock': 'stock',
    '#nameNormalized': 'nameNormalized',
    '#searchTokens': 'searchTokens',
    '#CategoryPK': 'CategoryPK',
    '#CategorySK': 'CategorySK',
    '#AvailabilityPK': 'AvailabilityPK',
    '#AvailabilitySK': 'AvailabilitySK',
    '#updatedAt': 'updatedAt',
    '#version': 'version',
    '#entityType': 'entityType',
  },
  ExpressionAttributeValues: {
    ':productName': item.productName,
    ':description': item.description || null,
    ':category': item.category,
    ':brand': item.brand || null,
    ':price': Number(item.price),
    ':images': Array.isArray(item.images) ? item.images : [],
    ':available': !!item.available,
    ':weight': item.weight ? Number(item.weight) : null,
    ':unit': item.unit || null,
    ':stock': Number(item.stock ?? 0),
    ':nameNormalized': item.nameNormalized,
    ':searchTokens': item.searchTokens || [],
    ':CategoryPK': item.CategoryPK,
    ':CategorySK': item.CategorySK,
    ':AvailabilityPK': item.AvailabilityPK,
    ':AvailabilitySK': item.AvailabilitySK,
    ':updatedAt': item.updatedAt,
    ':nextVersion': item.version,
    ':entityType': item.entityType,
    ...(currentVersion !== undefined && { ':version': Number(currentVersion) }),
  },
});

const createProductRepository = ({ client = documentClient, now = () => new Date() } = {}) => {
  const getMain = async (productId) => {
    const result = await client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: key(productId) })
    );
    return result.Item || null;
  };

  const findById = async (productId) => toDomain(await getMain(productId));

  const findAll = async ({ limit = 20, cursor, category } = {}) => {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'CategoryPK = :pk',
      ExpressionAttributeValues: {
        ':pk': category ? `CATEGORY#${category}` : 'CATEGORY#ALL',
      },
      ScanIndexForward: false,
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
  };

  const search = async (term, { limit = 20, cursor } = {}) => {
    const tokens = tokenize(term);
    if (!tokens.length) return { items: [], nextCursor: null };

    const results = await Promise.all(
      tokens.map((token, index) => {
        const params = {
          TableName: TABLE_NAME,
          IndexName: 'AvailabilityIndex',
          KeyConditionExpression: 'AvailabilityPK = :pk',
          ExpressionAttributeValues: { ':pk': `NAME#${token}` },
          ScanIndexForward: false,
          Limit: Number(limit),
        };
        if (index === 0 && cursor) {
          params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64url').toString());
        }
        return client.send(new QueryCommand(params));
      })
    );

    const seen = new Set();
    const items = [];
    for (const result of results) {
      for (const item of result.Items || []) {
        if (!seen.has(item.productId)) {
          seen.add(item.productId);
          const domain = toDomain(item);
          if (domain) items.push(domain);
        }
      }
    }

    const nextCursor = results[0].LastEvaluatedKey
      ? Buffer.from(JSON.stringify(results[0].LastEvaluatedKey)).toString('base64url')
      : null;

    return { items: items.slice(0, Number(limit)), nextCursor };
  };

  const createProduct = async (productId, data) => {
    const timestamp = now().toISOString();
    const mainItem = buildMainItem({ productId, data, now: timestamp, version: 0 });
    const listItem = buildListItem(mainItem);
    const tokenItems = mainItem.searchTokens.map((token) => buildTokenItem(mainItem, token));

    const transactItems = [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: mainItem,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        },
      },
      { Put: { TableName: TABLE_NAME, Item: listItem } },
      ...tokenItems.map((item) => ({ Put: { TableName: TABLE_NAME, Item: item } })),
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return toDomain(mainItem);
  };

  const updateProduct = async (productId, data) => {
    const current = await getMain(productId);
    if (!current) return null;

    const currentVersion = Number(current.version || 0);
    const nextVersion = currentVersion + 1;
    const timestamp = now().toISOString();

    const next = buildMainItem({
      productId,
      data: { ...current, ...data },
      now: timestamp,
      version: nextVersion,
      createdAt: current.createdAt,
    });

    const nextList = buildListItem(next);
    const nextTokenItems = next.searchTokens.map((token) => buildTokenItem(next, token));

    const oldTokens = current.searchTokens || [];
    const newTokenSet = new Set(next.searchTokens);
    const staleTokenDeletes = oldTokens
      .filter((t) => !newTokenSet.has(t))
      .map((token) => ({
        Delete: { TableName: TABLE_NAME, Key: key(productId, tokenSk(token)) },
      }));

    const transactItems = [
      { Update: { ...buildUpdateParams(next, currentVersion) } },
      { Update: { ...buildUpdateParams(nextList) } },
      ...nextTokenItems.map((item) => ({ Put: { TableName: TABLE_NAME, Item: item } })),
      ...staleTokenDeletes,
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return toDomain(next);
  };

  const setAvailability = async (productId, available) => {
    const current = await getMain(productId);
    if (!current) return null;

    const currentVersion = Number(current.version || 0);
    const nextVersion = currentVersion + 1;
    const timestamp = now().toISOString();

    const next = buildMainItem({
      productId,
      data: { ...current, available },
      now: timestamp,
      version: nextVersion,
      createdAt: current.createdAt,
    });

    const nextList = buildListItem(next);
    const tokenItems = next.searchTokens.map((token) => buildTokenItem(next, token));

    const transactItems = [
      { Update: { ...buildUpdateParams(next, currentVersion) } },
      { Update: { ...buildUpdateParams(nextList) } },
      ...tokenItems.map((item) => ({ Put: { TableName: TABLE_NAME, Item: item } })),
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return toDomain(next);
  };

  const remove = async (productId) => {
    const current = await getMain(productId);
    if (!current) return false;

    const tokens = current.searchTokens || [];
    const transactItems = [
      { Delete: { TableName: TABLE_NAME, Key: key(productId, MAIN_SK) } },
      { Delete: { TableName: TABLE_NAME, Key: key(productId, LIST_SK) } },
      ...tokens.map((token) => ({
        Delete: { TableName: TABLE_NAME, Key: key(productId, tokenSk(token)) },
      })),
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return true;
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
