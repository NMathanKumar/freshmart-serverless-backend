const {
  TransactWriteCommand,
  UpdateCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const { ConflictError } = require('@freshmart/service-shared').errors;

const tableName = () => {
  return config.dynamodb.tables.inventory || process.env.DDB_TABLE_INVENTORY || 'freshmart-dev-inventory';
};

const getReservation = async (productId, reservationId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: {
        pk: `INVENTORY#${productId}`,
        sk: `RESERVATION#${reservationId}`,
      },
    })
  );
  return result.Item;
};

const reserveStockTransaction = async (productId, reservationId, quantity, warehouseId, orderId) => {
  const now = new Date().toISOString();
  
  try {
    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: tableName(),
              Key: {
                pk: `INVENTORY#${productId}`,
                sk: `METADATA`,
              },
              UpdateExpression: 'SET stock = stock - :quantity, updatedAt = :now',
              ConditionExpression: 'stock >= :quantity',
              ExpressionAttributeValues: {
                ':quantity': quantity,
                ':now': now,
              },
            },
          },
          {
            Put: {
              TableName: tableName(),
              Item: {
                pk: `INVENTORY#${productId}`,
                sk: `RESERVATION#${reservationId}`,
                productId,
                reservationId,
                warehouseId,
                orderId,
                quantity,
                status: 'ACTIVE',
                createdAt: now,
                updatedAt: now,
              },
              ConditionExpression: 'attribute_not_exists(pk)',
            },
          },
        ],
      })
    );
  } catch (err) {
    if (err.name === 'TransactionCanceledException') {
      const code = err.CancellationReasons?.[0]?.Code;
      if (code === 'ConditionalCheckFailed') {
        throw new ConflictError(`Insufficient stock for product ${productId} to reserve ${quantity}`);
      }
    }
    throw err;
  }
};

const commitReservation = async (productId, reservationId) => {
  const now = new Date().toISOString();
  try {
    await documentClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: {
          pk: `INVENTORY#${productId}`,
          sk: `RESERVATION#${reservationId}`,
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :now',
        ConditionExpression: 'attribute_exists(pk) AND #status = :activeStatus',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'COMMITTED',
          ':activeStatus': 'ACTIVE',
          ':now': now,
        },
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new ConflictError(`Reservation ${reservationId} not found or not in ACTIVE status`);
    }
    throw err;
  }
};

const releaseReservationTransaction = async (productId, reservationId, quantity) => {
  const now = new Date().toISOString();
  
  try {
    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: tableName(),
              Key: {
                pk: `INVENTORY#${productId}`,
                sk: `RESERVATION#${reservationId}`,
              },
              UpdateExpression: 'SET #status = :status, updatedAt = :now',
              ConditionExpression: 'attribute_exists(pk) AND #status = :activeStatus',
              ExpressionAttributeNames: {
                '#status': 'status',
              },
              ExpressionAttributeValues: {
                ':status': 'RELEASED',
                ':activeStatus': 'ACTIVE',
                ':now': now,
              },
            },
          },
          {
            Update: {
              TableName: tableName(),
              Key: {
                pk: `INVENTORY#${productId}`,
                sk: `METADATA`,
              },
              UpdateExpression: 'SET stock = stock + :quantity, updatedAt = :now',
              ExpressionAttributeValues: {
                ':quantity': quantity,
                ':now': now,
              },
            },
          },
        ],
      })
    );
  } catch (err) {
    if (err.name === 'TransactionCanceledException') {
      const code = err.CancellationReasons?.[0]?.Code;
      if (code === 'ConditionalCheckFailed') {
        throw new ConflictError(`Reservation ${reservationId} not found or not in ACTIVE status`);
      }
    }
    throw err;
  }
};

module.exports = {
  getReservation,
  reserveStockTransaction,
  commitReservation,
  releaseReservationTransaction,
};
