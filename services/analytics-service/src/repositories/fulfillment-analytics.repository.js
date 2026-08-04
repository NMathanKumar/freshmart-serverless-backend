const { QueryCommand, UpdateCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config?.dynamodb?.tables?.analytics) => {
  return tableName || process.env.DDB_TABLE_ANALYTICS || 'freshmart-dev-analytics';
};

const createFulfillmentAnalyticsRepository = ({
  client = documentClient,
  tableName = null,
} = {}) => {
  const resolveTableName = () => getTableName(tableName);

  const getOrderState = async (orderId) => {
    const result = await client.send(
      new GetCommand({
        TableName: resolveTableName(),
        Key: {
          pk: 'ADMIN#ORDER',
          sk: `ITEM#${orderId}`,
        },
      })
    );
    return result.Item;
  };

  const saveOrderState = async (orderId, state) => {
    await client.send(
      new PutCommand({
        TableName: resolveTableName(),
        Item: {
          pk: 'ADMIN#ORDER',
          sk: `ITEM#${orderId}`,
          ...state,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  };

  const incrementMetric = async (dateString, monthString, fieldName, incrementValue = 1) => {
    const value = Number(incrementValue) || 0;

    const buildUpdateCommand = (skValue) => {
      return new UpdateCommand({
        TableName: resolveTableName(),
        Key: {
          pk: 'TYPE#FULFILLMENT',
          sk: skValue,
        },
        UpdateExpression: `SET #field = if_not_exists(#field, :zero) + :val, updatedAt = :updatedAt, entityType = if_not_exists(entityType, :entityType)`,
        ExpressionAttributeNames: {
          '#field': fieldName,
        },
        ExpressionAttributeValues: {
          ':val': value,
          ':zero': 0,
          ':updatedAt': new Date().toISOString(),
          ':entityType': 'FULFILLMENT_ANALYTICS',
        },
      });
    };

    await Promise.all([
      client.send(buildUpdateCommand(`DATE#${dateString}`)),
      client.send(buildUpdateCommand(`MONTH#${monthString}`)),
    ]);
  };

  const incrementMultipleMetrics = async (dateString, monthString, metrics) => {
    const buildUpdateCommand = (skValue) => {
      const updateExpressions = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {
        ':zero': 0,
        ':updatedAt': new Date().toISOString(),
        ':entityType': 'FULFILLMENT_ANALYTICS',
      };

      let i = 0;
      for (const [key, val] of Object.entries(metrics)) {
        updateExpressions.push(`#field${i} = if_not_exists(#field${i}, :zero) + :val${i}`);
        expressionAttributeNames[`#field${i}`] = key;
        expressionAttributeValues[`:val${i}`] = Number(val) || 0;
        i++;
      }

      return new UpdateCommand({
        TableName: resolveTableName(),
        Key: {
          pk: 'TYPE#FULFILLMENT',
          sk: skValue,
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}, updatedAt = :updatedAt, entityType = if_not_exists(entityType, :entityType)`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      });
    };

    await Promise.all([
      client.send(buildUpdateCommand(`DATE#${dateString}`)),
      client.send(buildUpdateCommand(`MONTH#${monthString}`)),
    ]);
  };

  const queryFulfillmentAnalytics = async (startDate, endDate) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :startSk AND :endSk',
        ExpressionAttributeValues: {
          ':pk': 'TYPE#FULFILLMENT',
          ':startSk': `DATE#${startDate}`,
          ':endSk': `DATE#${endDate}`,
        },
      })
    );
    return result.Items || [];
  };

  const queryFulfillmentAnalyticsMonthly = async (startMonth, endMonth) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :startSk AND :endSk',
        ExpressionAttributeValues: {
          ':pk': 'TYPE#FULFILLMENT',
          ':startSk': `MONTH#${startMonth}`,
          ':endSk': `MONTH#${endMonth}`,
        },
      })
    );
    return result.Items || [];
  };

  return {
    getOrderState,
    saveOrderState,
    incrementMetric,
    incrementMultipleMetrics,
    queryFulfillmentAnalytics,
    queryFulfillmentAnalyticsMonthly,
  };
};

module.exports = createFulfillmentAnalyticsRepository();
module.exports.createFulfillmentAnalyticsRepository = createFulfillmentAnalyticsRepository;
