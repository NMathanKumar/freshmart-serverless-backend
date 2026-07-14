const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.payments) => {
  if (!tableName) {
    throw new Error('Missing DDB_TABLE_PAYMENTS');
  }
  return tableName;
};

const paymentPk = (paymentId) => `PAYMENT#${paymentId}`;
const paymentSk = () => 'META';
const orderPk = (orderId) => `ORDER#${orderId}`;
const statusPk = (status) => `STATUS#${status}`;

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    paymentId: item.paymentId,
    orderId: item.orderId,
    userId: item.userId,
    amount: normalizeNumber(item.amount),
    currency: item.currency || 'INR',
    paymentMethod: item.paymentMethod,
    transactionId: item.transactionId || null,
    paymentStatus: item.paymentStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: normalizeNumber(item.version),
  };
};

const createPaymentRepository = ({
  client = documentClient,
  tableName = getTableName(),
  now = () => new Date(),
} = {}) => {
  const isConditionalFailure = (error) =>
    error?.name === 'ConditionalCheckFailedException' ||
    error?.Code === 'ConditionalCheckFailedException' ||
    error?.code === 'ConditionalCheckFailedException';

  const createConditionalError = (message) => {
    const error = new Error(message);
    error.code = 'CONFLICT';
    return error;
  };

  const create = async ({
    paymentId,
    orderId,
    userId,
    amount,
    currency = 'INR',
    paymentMethod,
    transactionId = null,
    paymentStatus = 'PENDING',
  }) => {
    const timestamp = now().toISOString();
    const item = {
      pk: paymentPk(paymentId),
      sk: paymentSk(),
      paymentId,
      orderId,
      userId,
      amount: normalizeNumber(amount),
      currency,
      paymentMethod,
      transactionId,
      paymentStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 0,
      gsi1pk: orderPk(orderId),
      gsi1sk: `CREATED#${timestamp}`,
      gsi2pk: statusPk(paymentStatus),
      gsi2sk: `CREATED#${timestamp}`,
      entityType: 'PAYMENT',
    };

    try {
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        })
      );
    } catch (error) {
      if (isConditionalFailure(error)) {
        throw createConditionalError(`Payment '${paymentId}' already exists`);
      }
      throw error;
    }

    return toDomain(item);
  };

  const findById = async (paymentId) => {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk(paymentId),
          sk: paymentSk(),
        },
      })
    );
    return toDomain(result.Item || null);
  };

  const findLatestByOrderId = async (orderId) => {
    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'gsi1',
        KeyConditionExpression: 'gsi1pk = :pk',
        ExpressionAttributeValues: {
          ':pk': orderPk(orderId),
        },
        ScanIndexForward: false,
        Limit: 1,
      })
    );
    return toDomain(result.Items?.[0] || null);
  };

  const findLatestByStatus = async (paymentStatus) => {
    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'gsi2',
        KeyConditionExpression: 'gsi2pk = :pk',
        ExpressionAttributeValues: {
          ':pk': statusPk(paymentStatus),
        },
        ScanIndexForward: false,
      })
    );
    return (result.Items || []).map(toDomain);
  };

  const updateStatus = async (paymentId, paymentStatus, transactionIdOrOptions = undefined) => {
    const options =
      transactionIdOrOptions && typeof transactionIdOrOptions === 'object' && !Array.isArray(transactionIdOrOptions)
        ? transactionIdOrOptions
        : { transactionId: transactionIdOrOptions };

    const current = await findById(paymentId);
    if (!current) {
      return null;
    }

    const timestamp = now().toISOString();
    const nextVersion = Number(current.version || 0) + 1;
    const hasTransactionId = options.transactionId !== undefined;
    const updatedItem = {
      ...current,
      paymentStatus,
      transactionId: hasTransactionId ? options.transactionId : current.transactionId || null,
      updatedAt: timestamp,
      version: nextVersion,
    };

    try {
      const result = await client.send(
        new UpdateCommand({
          TableName: tableName,
          Key: {
            pk: paymentPk(paymentId),
            sk: paymentSk(),
          },
          UpdateExpression: [
            'SET paymentStatus = :paymentStatus',
            'gsi2pk = :gsi2pk',
            'gsi2sk = :gsi2sk',
            'updatedAt = :updatedAt',
            '#version = :nextVersion',
            hasTransactionId ? 'transactionId = :transactionId' : null,
          ]
            .filter(Boolean)
            .join(', '),
          ConditionExpression: '#version = :expectedVersion',
          ExpressionAttributeNames: {
            '#version': 'version',
          },
          ExpressionAttributeValues: hasTransactionId
            ? {
                ':paymentStatus': paymentStatus,
                ':gsi2pk': statusPk(paymentStatus),
                ':gsi2sk': `CREATED#${current.createdAt}`,
                ':updatedAt': timestamp,
                ':expectedVersion': Number(current.version || 0),
                ':nextVersion': nextVersion,
                ':transactionId': options.transactionId,
              }
            : {
                ':paymentStatus': paymentStatus,
                ':gsi2pk': statusPk(paymentStatus),
                ':gsi2sk': `CREATED#${current.createdAt}`,
                ':updatedAt': timestamp,
                ':expectedVersion': Number(current.version || 0),
                ':nextVersion': nextVersion,
              },
          ReturnValues: 'ALL_NEW',
        })
      );
      return toDomain(result.Attributes || updatedItem);
    } catch (error) {
      if (isConditionalFailure(error)) {
        throw createConditionalError(`Payment '${paymentId}' update conflict`);
      }
      throw error;
    }
  };

  const remove = async (paymentId) => {
    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk(paymentId),
          sk: paymentSk(),
        },
      })
    );
    return true;
  };

  return {
    tableName,
    create,
    findById,
    findLatestByOrderId,
    findLatestByStatus,
    updateStatus,
    remove,
  };
};

const repository = createPaymentRepository();

module.exports = repository;
module.exports.createPaymentRepository = createPaymentRepository;
