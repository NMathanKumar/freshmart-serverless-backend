const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.notifications) => {
  if (!tableName) throw new Error('Missing DDB_TABLE_NOTIFICATIONS');
  return tableName;
};

const key = (notificationId) => ({
  pk: `NOTIFICATION#${notificationId}`,
  sk: 'META',
});

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    notificationId: item.notificationId,
    userId: item.userId,
    type: item.type,
    channel: item.channel || 'SNS',
    subject: item.subject || null,
    message: item.message || null,
    payload: item.payload || {},
    status: item.status,
    deliveryStatus: item.deliveryStatus || item.status,
    failureReason: item.failureReason || null,
    eventType: item.eventType || null,
    correlationId: item.correlationId || null,
    requestId: item.requestId || null,
    retryCount: normalizeNumber(item.retryCount),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    deliveredAt: item.deliveredAt || null,
    version: normalizeNumber(item.version),
  };
};

const createNotificationRepository = ({
  client = documentClient,
  tableName = null,
  now = () => new Date(),
} = {}) => {
  const resolveTableName = () => getTableName(tableName);
  const isConditionalFailure = (error) =>
    error?.name === 'ConditionalCheckFailedException' ||
    error?.Code === 'ConditionalCheckFailedException' ||
    error?.code === 'ConditionalCheckFailedException';

  const create = async ({
    notificationId,
    userId,
    type,
    channel = 'SNS',
    subject,
    message,
    payload = {},
    status = 'QUEUED',
    eventType,
    correlationId,
    requestId,
  }) => {
    const timestamp = now().toISOString();
    const item = {
      ...key(notificationId),
      notificationId,
      userId,
      type,
      channel,
      subject: subject || null,
      message: message || null,
      payload,
      status,
      deliveryStatus: status,
      failureReason: null,
      eventType: eventType || null,
      correlationId: correlationId || null,
      requestId: requestId || null,
      retryCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      deliveredAt: null,
      version: 0,
      gsi1pk: `USER#${userId}`,
      gsi1sk: `CREATED#${timestamp}`,
      gsi2pk: `STATUS#${status}`,
      gsi2sk: `CREATED#${timestamp}`,
      entityType: 'NOTIFICATION',
    };

    try {
      await client.send(
        new PutCommand({
          TableName: resolveTableName(),
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        })
      );
    } catch (error) {
      if (isConditionalFailure(error)) {
        const conflict = new Error(`Notification '${notificationId}' already exists`);
        conflict.code = 'CONFLICT';
        throw conflict;
      }
      throw error;
    }

    return toDomain(item);
  };

  const findById = async (notificationId) => {
    const result = await client.send(
      new GetCommand({
        TableName: resolveTableName(),
        Key: key(notificationId),
      })
    );
    return toDomain(result.Item || null);
  };

  const listByUser = async (userId) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        IndexName: 'gsi1',
        KeyConditionExpression: 'gsi1pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
        },
        ScanIndexForward: false,
      })
    );
    return (result.Items || []).map(toDomain);
  };

  const listByStatus = async (status) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
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

  const updateStatus = async (notificationId, status, { failureReason = null, deliveredAt = null } = {}) => {
    const current = await findById(notificationId);
    if (!current) return null;

    const timestamp = now().toISOString();
    const nextVersion = Number(current.version || 0) + 1;
    const attributes = {
      ':status': status,
      ':updatedAt': timestamp,
      ':gsi2pk': `STATUS#${status}`,
      ':gsi2sk': `CREATED#${current.createdAt}`,
      ':expectedVersion': Number(current.version || 0),
      ':nextVersion': nextVersion,
      ':failureReason': failureReason,
      ':deliveredAt': deliveredAt || timestamp,
    };

    const updateParts = [
      'SET #status = :status',
      'gsi2pk = :gsi2pk',
      'gsi2sk = :gsi2sk',
      'updatedAt = :updatedAt',
      '#version = :nextVersion',
    ];

    if (status === 'DELIVERED') {
      updateParts.push('deliveredAt = :deliveredAt');
    }
    if (failureReason) {
      updateParts.push('failureReason = :failureReason');
    }

    const result = await client.send(
      new UpdateCommand({
        TableName: resolveTableName(),
        Key: key(notificationId),
        UpdateExpression: updateParts.join(', '),
        ConditionExpression: '#version = :expectedVersion',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#version': 'version',
        },
        ExpressionAttributeValues: attributes,
        ReturnValues: 'ALL_NEW',
      })
    );

    return toDomain(result.Attributes || null);
  };

  const remove = async (notificationId) => {
    await client.send(
      new DeleteCommand({
        TableName: resolveTableName(),
        Key: key(notificationId),
      })
    );
    return true;
  };

  return {
    tableName,
    create,
    findById,
    listByUser,
    listByStatus,
    updateStatus,
    remove,
  };
};

const repository = createNotificationRepository();

module.exports = repository;
module.exports.createNotificationRepository = createNotificationRepository;
