const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.notifications) => {
  return tableName || process.env.DDB_TABLE_NOTIFICATIONS || 'freshmart-dev-notifications';
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
    payload,
    status = 'PENDING',
    deliveryStatus,
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
      payload: payload || {},
      status,
      deliveryStatus: deliveryStatus || status,
      failureReason: null,
      eventType: eventType || null,
      correlationId: correlationId || null,
      requestId: requestId || null,
      retryCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      deliveredAt: status === 'DELIVERED' || deliveryStatus === 'DELIVERED' ? timestamp : null,
      version: 0,
      gsi1pk: `USER#${userId}`,
      gsi1sk: `NOTIFICATION#${notificationId}`,
      gsi2pk: `STATUS#${status}`,
      gsi2sk: `NOTIFICATION#${notificationId}`,
    };

    try {
      await client.send(
        new PutCommand({
          TableName: resolveTableName(),
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        })
      );
      return toDomain(item);
    } catch (error) {
      if (isConditionalFailure(error)) {
        const existingError = new Error(`Notification ${notificationId} already exists`);
        existingError.code = 'CONFLICT';
        throw existingError;
      }
      throw error;
    }
  };

  const getById = async (notificationId) => {
    const response = await client.send(
      new GetCommand({
        TableName: resolveTableName(),
        Key: key(notificationId),
      })
    );
    return toDomain(response.Item);
  };

  const updateStatus = async (notificationId, statusOrOptions, extraOptions = {}) => {
    const options = typeof statusOrOptions === 'string' ? { status: statusOrOptions, ...extraOptions } : (statusOrOptions || {});
    const { status, deliveryStatus, failureReason, version } = options;

    const timestamp = now().toISOString();
    const updateExpressions = ['#status = :status', '#updatedAt = :updatedAt'];
    const expressionAttributeNames = {
      '#status': 'status',
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues = {
      ':status': status,
      ':updatedAt': timestamp,
    };

    if (deliveryStatus !== undefined) {
      updateExpressions.push('#deliveryStatus = :deliveryStatus');
      expressionAttributeNames['#deliveryStatus'] = 'deliveryStatus';
      expressionAttributeValues[':deliveryStatus'] = deliveryStatus;

      if (deliveryStatus === 'DELIVERED') {
        updateExpressions.push('#deliveredAt = :deliveredAt');
        expressionAttributeNames['#deliveredAt'] = 'deliveredAt';
        expressionAttributeValues[':deliveredAt'] = timestamp;
      }
    }

    if (failureReason !== undefined) {
      updateExpressions.push('#failureReason = :failureReason');
      expressionAttributeNames['#failureReason'] = 'failureReason';
      expressionAttributeValues[':failureReason'] = failureReason;
    }

    updateExpressions.push('#gsi2pk = :gsi2pk');
    expressionAttributeNames['#gsi2pk'] = 'gsi2pk';
    expressionAttributeValues[':gsi2pk'] = `STATUS#${status}`;

    updateExpressions.push('#version = #version + :inc');
    expressionAttributeNames['#version'] = 'version';
    expressionAttributeValues[':inc'] = 1;

    let conditionExpression = 'attribute_exists(pk) AND attribute_exists(sk)';
    if (version !== undefined) {
      conditionExpression += ' AND #version = :expectedVersion';
      expressionAttributeValues[':expectedVersion'] = version;
    }

    try {
      const response = await client.send(
        new UpdateCommand({
          TableName: resolveTableName(),
          Key: key(notificationId),
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        })
      );
      return toDomain(response.Attributes);
    } catch (error) {
      if (isConditionalFailure(error)) {
        const existing = await getById(notificationId);
        const versionError = new Error(
          existing
            ? `Version mismatch for notification ${notificationId}`
            : `Notification ${notificationId} not found`
        );
        versionError.code = existing ? 'VERSION_MISMATCH' : 'NOT_FOUND';
        throw versionError;
      }
      throw error;
    }
  };

  return {
    create,
    getById,
    updateStatus,
  };
};

module.exports = {
  createNotificationRepository,
  toDomain,
};
