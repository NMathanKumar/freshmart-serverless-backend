const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

// Fix #6 — resolve once at module load, fail fast on cold start instead of per-call
const TABLE_NAME = (() => {
  const name = config.dynamodb.tables.catalogItems;
  if (!name) throw new Error('Missing DDB_TABLE_CATALOG_ITEMS');
  return name;
})();

// Fix #9 — plain constants, no zero-arg function overhead
const MAIN_SK = 'META';
const LIST_SK = 'LIST';
const MAX_TRANSACT_ITEMS = 100;

const tokenSk = (token) => `TOKEN#${token}`;
const key = (foodId, sk = MAIN_SK) => ({ PK: `FOOD#${foodId}`, SK: sk });

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) => [...new Set(normalizeText(value).split(' ').filter(Boolean))];

// Fix #7 — null guard returns null immediately, single mapping branch, no dead conditional
const toDomain = (item) => {
  if (!item) return null;
  return {
    foodId: item.foodId,
    name: item.name,
    description: item.description || null,
    category: item.category,
    price: Number(item.price),
    imageUrl: item.imageUrl || null,
    available: !!item.available,
    preparationTime: Number(item.preparationTime ?? 10),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: Number(item.version || 0),
  };
};

// buildMainItem does NOT increment version — caller owns version logic (Fix #8 side-effect)
const buildMainItem = ({ foodId, data, now, version = 0, createdAt }) => {
  const normalizedName = normalizeText(data.name);
  const normalizedCategory = normalizeText(data.category);
  const searchTokens = tokenize(data.name).slice(0, MAX_TRANSACT_ITEMS - 5);
  return {
    ...key(foodId),
    foodId,
    name: data.name,
    description: data.description || null,
    category: data.category,
    price: Number(data.price),
    imageUrl: data.imageUrl || null,
    available: data.available ?? true,
    preparationTime: data.preparationTime ?? 10,
    nameNormalized: normalizedName,
    searchTokens,
    version,
    CategoryPK: `CATEGORY#${normalizedCategory}`,
    CategorySK: `CREATED#${createdAt || now}#FOOD#${foodId}`,
    AvailabilityPK: `NAME#${normalizedName}`,
    AvailabilitySK: `FOOD#${foodId}`,
    createdAt: createdAt || now,
    updatedAt: now,
    entityType: 'FOOD',
  };
};

const buildListItem = (mainItem) => ({
  ...key(mainItem.foodId, LIST_SK),
  ...mainItem,
  SK: LIST_SK,
  CategoryPK: 'CATEGORY#ALL',
  CategorySK: `CREATED#${mainItem.createdAt}#FOOD#${mainItem.foodId}`,
  entityType: 'FOOD_LIST_INDEX',
});

const buildTokenItem = (mainItem, token) => ({
  ...key(mainItem.foodId, tokenSk(token)),
  ...mainItem,
  SK: tokenSk(token),
  searchToken: token,
  AvailabilityPK: `NAME#${token}`,
  AvailabilitySK: `FOOD#${mainItem.foodId}`,
  entityType: 'FOOD_SEARCH_INDEX',
});

// Builds the full UpdateCommand params for a single item (main, list, or token)
const buildUpdateParams = (item, currentVersion) => ({
  TableName: TABLE_NAME,
  Key: { PK: item.PK, SK: item.SK },
  UpdateExpression: `
    SET #name = :name,
        #description = :description,
        #category = :category,
        #price = :price,
        #imageUrl = :imageUrl,
        #available = :available,
        #preparationTime = :preparationTime,
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
  // Optimistic lock only on the main item — list/token items mirror main
  ConditionExpression: currentVersion !== undefined ? '#version = :version' : undefined,
  ExpressionAttributeNames: {
    '#name': 'name',
    '#description': 'description',
    '#category': 'category',
    '#price': 'price',
    '#imageUrl': 'imageUrl',
    '#available': 'available',
    '#preparationTime': 'preparationTime',
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
    ':name': item.name,
    ':description': item.description || null,
    ':category': item.category,
    ':price': Number(item.price),
    ':imageUrl': item.imageUrl || null,
    ':available': !!item.available,
    ':preparationTime': Number(item.preparationTime ?? 10),
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

const createMenuRepository = ({ client = documentClient, now = () => new Date() } = {}) => {
  const getMain = async (foodId) => {
    const result = await client.send(
      new GetCommand({ TableName: TABLE_NAME, Key: key(foodId) })
    );
    return result.Item || null;
  };

  const findById = async (foodId) => toDomain(await getMain(foodId));

  // Fix #1 — DynamoDB-native cursor pagination using Limit + LastEvaluatedKey
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

  // Fix #8 — query each token separately, deduplicate by foodId, apply cursor on first token only
  const search = async (term, { limit = 20, cursor } = {}) => {
    const tokens = tokenize(term);
    if (!tokens.length) return { items: [], nextCursor: null };

    // Query all tokens in parallel; cursor applies to the first token query only
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

    // Deduplicate across token results by foodId, preserve first-seen order
    const seen = new Set();
    const items = [];
    for (const result of results) {
      for (const item of result.Items || []) {
        if (!seen.has(item.foodId)) {
          seen.add(item.foodId);
          const domain = toDomain(item);
          if (domain) items.push(domain);
        }
      }
    }

    // nextCursor from the first token query (primary pagination axis)
    const nextCursor = results[0].LastEvaluatedKey
      ? Buffer.from(JSON.stringify(results[0].LastEvaluatedKey)).toString('base64url')
      : null;

    return { items: items.slice(0, Number(limit)), nextCursor };
  };

  // Fix #2 — atomic multi-item create using TransactWriteCommand
  const createFood = async (foodId, data) => {
    const timestamp = now().toISOString();
    const mainItem = buildMainItem({ foodId, data, now: timestamp, version: 0 });
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
      {
        Put: {
          TableName: TABLE_NAME,
          Item: listItem,
        },
      },
      ...tokenItems.map((item) => ({ Put: { TableName: TABLE_NAME, Item: item } })),
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return toDomain(mainItem);
  };

  // Fix #3 — updateFood updates main + list + token items consistently
  const updateFood = async (foodId, data) => {
    const current = await getMain(foodId);
    if (!current) return null;

    const currentVersion = Number(current.version || 0);
    const nextVersion = currentVersion + 1;
    const timestamp = now().toISOString();

    const next = buildMainItem({
      foodId,
      data: { ...current, ...data },
      now: timestamp,
      version: nextVersion,
      createdAt: current.createdAt, // preserve original createdAt
    });

    const nextList = buildListItem(next);
    const nextTokenItems = next.searchTokens.map((token) => buildTokenItem(next, token));

    // Delete stale token items whose tokens no longer exist after the name change
    const oldTokens = current.searchTokens || [];
    const newTokenSet = new Set(next.searchTokens);
    const staleTokenDeletes = oldTokens
      .filter((t) => !newTokenSet.has(t))
      .map((token) => ({
        Delete: { TableName: TABLE_NAME, Key: key(foodId, tokenSk(token)) },
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

  // Fix #4 — setAvailability keeps list + token items consistent
  const setAvailability = async (foodId, available) => {
    const current = await getMain(foodId);
    if (!current) return null;

    const currentVersion = Number(current.version || 0);
    const nextVersion = currentVersion + 1;
    const timestamp = now().toISOString();

    const next = buildMainItem({
      foodId,
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

  // Fix #5 — remove deletes main + list + all token items atomically, no orphans
  const remove = async (foodId) => {
    const current = await getMain(foodId);
    if (!current) return false;

    const tokens = current.searchTokens || [];
    const transactItems = [
      { Delete: { TableName: TABLE_NAME, Key: key(foodId, MAIN_SK) } },
      { Delete: { TableName: TABLE_NAME, Key: key(foodId, LIST_SK) } },
      ...tokens.map((token) => ({
        Delete: { TableName: TABLE_NAME, Key: key(foodId, tokenSk(token)) },
      })),
    ];

    await client.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return true;
  };

  return {
    createFood,
    findById,
    findAll,
    search,
    updateFood,
    setAvailability,
    remove,
  };
};

module.exports = createMenuRepository;
