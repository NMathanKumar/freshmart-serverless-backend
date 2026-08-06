const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.payments) => {
  return tableName || process.env.DDB_TABLE_PAYMENTS || 'freshmart-dev-payments';
};

const paymentPk = (paymentId) => `PAYMENT#${paymentId}`;
const paymentSk = () => 'META';

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
                ':updatedAt': timestamp,
                ':expectedVersion': Number(current.version || 0),
                ':nextVersion': nextVersion,
                ':transactionId': options.transactionId,
              }
            : {
                ':paymentStatus': paymentStatus,
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
    updateStatus,
    remove,
  };
};

const repository = createPaymentRepository();

module.exports = repository;
module.exports.createPaymentRepository = createPaymentRepository;
