const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.admin) => {
  if (!tableName) throw new Error('Missing DDB_TABLE_ADMIN');
  return tableName;
};

const entityKey = (entityType, itemId) => ({
  pk: `ADMIN#${entityType}`,
  sk: `ITEM#${itemId}`,
});

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    adminItemId: item.adminItemId,
    entityType: item.entityType,
    data: item.data || {},
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    createdBy: item.createdBy || null,
    version: normalizeNumber(item.version),
  };
};

const createAdminRepository = ({
  client = documentClient,
  tableName = getTableName(),
  now = () => new Date(),
} = {}) => {
  const createEntity = async ({
    entityType,
    itemId,
    data = {},
    status = 'ACTIVE',
    createdBy = 'system',
  }) => {
    const timestamp = now().toISOString();
    const item = {
      ...entityKey(entityType, itemId),
      adminItemId: itemId,
      entityType,
      data,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy,
      version: 0,
      gsi1pk: `TYPE#${entityType}`,
      gsi1sk: `UPDATED#${timestamp}`,
      gsi2pk: `STATUS#${status}`,
      gsi2sk: `UPDATED#${timestamp}`,
    };

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
    );

    return toDomain(item);
  };

  const getEntity = async (entityType, itemId) => {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: entityKey(entityType, itemId),
      })
    );
    return toDomain(result.Item || null);
  };

  const saveEntity = async ({
    entityType,
    itemId,
    data = {},
    status = 'ACTIVE',
    createdBy = 'system',
  }) => {
    const current = await getEntity(entityType, itemId);
    const timestamp = now().toISOString();

    if (!current) {
      return createEntity({ entityType, itemId, data, status, createdBy });
    }

    const nextVersion = Number(current.version || 0) + 1;
    const result = await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: entityKey(entityType, itemId),
        UpdateExpression:
          'SET adminItemId = :adminItemId, data = :data, #status = :status, updatedAt = :updatedAt, createdBy = if_not_exists(createdBy, :createdBy), gsi1pk = :gsi1pk, gsi1sk = :gsi1sk, gsi2pk = :gsi2pk, gsi2sk = :gsi2sk, #version = :nextVersion',
        ConditionExpression: '#version = :expectedVersion',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#version': 'version',
        },
        ExpressionAttributeValues: {
          ':adminItemId': itemId,
          ':data': data,
          ':status': status,
          ':updatedAt': timestamp,
          ':createdBy': createdBy,
          ':gsi1pk': `TYPE#${entityType}`,
          ':gsi1sk': `UPDATED#${timestamp}`,
          ':gsi2pk': `STATUS#${status}`,
          ':gsi2sk': `UPDATED#${timestamp}`,
          ':expectedVersion': Number(current.version || 0),
          ':nextVersion': nextVersion,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return toDomain(result.Attributes || null);
  };

  const listByEntityType = async (entityType) => {
    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'gsi1',
        KeyConditionExpression: 'gsi1pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `TYPE#${entityType}`,
        },
        ScanIndexForward: false,
      })
    );
    return (result.Items || []).map(toDomain);
  };

  const listByStatus = async (status) => {
    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'gsi2',
        KeyConditionExpression: 'gsi2pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `STATUS#${status}`,
        },
        ScanIndexForward: false,
      })
    );
    return (result.Items || []).map(toDomain);
  };

  const deleteEntity = async (entityType, itemId) => {
    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: entityKey(entityType, itemId),
      })
    );
    return true;
  };

  return {
    tableName,
    createEntity,
    getEntity,
    saveEntity,
    listByEntityType,
    listByStatus,
    deleteEntity,
  };
};

const repository = createAdminRepository();

module.exports = repository;
module.exports.createAdminRepository = createAdminRepository;
