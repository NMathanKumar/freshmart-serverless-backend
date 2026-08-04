const { QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config?.dynamodb?.tables?.analytics) => {
  return tableName || process.env.DDB_TABLE_ANALYTICS || 'freshmart-dev-analytics';
};

const createProcurementRepository = ({
  client = documentClient,
  tableName = null,
} = {}) => {
  const resolveTableName = () => getTableName(tableName);

  const incrementMetric = async (dateString, monthString, fieldName, incrementValue) => {
    const value = Number(incrementValue) || 0;
    
    const buildUpdateCommand = (skValue) => {
      return new UpdateCommand({
        TableName: resolveTableName(),
        Key: {
          pk: 'TYPE#PROCUREMENT',
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
          ':entityType': 'PROCUREMENT_ANALYTICS'
        },
      });
    };

    // Update both daily and monthly records in parallel
    await Promise.all([
      client.send(buildUpdateCommand(`DATE#${dateString}`)),
      client.send(buildUpdateCommand(`MONTH#${monthString}`))
    ]);
  };

  const queryProcurementAnalytics = async (startDate, endDate) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :startSk AND :endSk',
        ExpressionAttributeValues: {
          ':pk': 'TYPE#PROCUREMENT',
          ':startSk': `DATE#${startDate}`,
          ':endSk': `DATE#${endDate}`,
        },
      })
    );

    return result.Items || [];
  };
  
  const queryProcurementAnalyticsMonthly = async (startMonth, endMonth) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :startSk AND :endSk',
        ExpressionAttributeValues: {
          ':pk': 'TYPE#PROCUREMENT',
          ':startSk': `MONTH#${startMonth}`,
          ':endSk': `MONTH#${endMonth}`,
        },
      })
    );

    return result.Items || [];
  };

  return {
    incrementMetric,
    queryProcurementAnalytics,
    queryProcurementAnalyticsMonthly
  };
};

module.exports = createProcurementRepository();
module.exports.createProcurementRepository = createProcurementRepository;
