const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const getTableName = (tableName = config.dynamodb.tables.analytics) => {
  if (!tableName) throw new Error('Missing DDB_TABLE_ANALYTICS');
  return tableName;
};

const reportKey = (reportType, date) => ({
  pk: `REPORT#${reportType}`,
  sk: `DATE#${date}`,
});

const metricKey = (reportType, metricName, date) => ({
  pk: `REPORT#${reportType}`,
  sk: `METRIC#${metricName}#DATE#${date}`,
});

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toDomain = (item) => {
  if (!item) return null;
  return {
    reportId: item.reportId,
    reportType: item.reportType,
    date: item.date,
    totalOrders: normalizeNumber(item.totalOrders),
    completedOrders: normalizeNumber(item.completedOrders),
    cancelledOrders: normalizeNumber(item.cancelledOrders),
    totalRevenue: normalizeNumber(item.totalRevenue),
    failedPayments: normalizeNumber(item.failedPayments),
    lowStockEvents: normalizeNumber(item.lowStockEvents),
    notificationsSent: normalizeNumber(item.notificationsSent),
    userRegistrations: normalizeNumber(item.userRegistrations),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: normalizeNumber(item.version),
  };
};

const createAnalyticsRepository = ({
  client = documentClient,
  tableName = null,
  now = () => new Date(),
} = {}) => {
  const resolveTableName = () => getTableName(tableName);
  const trackedMetrics = [
    'totalOrders',
    'completedOrders',
    'cancelledOrders',
    'totalRevenue',
    'failedPayments',
    'lowStockEvents',
    'notificationsSent',
    'userRegistrations',
  ];

  const getReport = async (reportType, date) => {
    const result = await client.send(
      new GetCommand({
        TableName: resolveTableName(),
        Key: reportKey(reportType, date),
      })
    );
    return toDomain(result.Item || null);
  };

  const syncMetricProjections = async (report) => {
    const timestamp = now().toISOString();

    for (const metricName of trackedMetrics) {
      const value = normalizeNumber(report[metricName]);
      // Keep per-metric history queryable without scans using GSI2.
      // eslint-disable-next-line no-await-in-loop
      await client.send(
        new PutCommand({
          TableName: resolveTableName(),
          Item: {
            ...metricKey(report.reportType, metricName, report.date),
            reportId: report.reportId,
            reportType: report.reportType,
            date: report.date,
            metricName,
            metricValue: value,
            createdAt: report.createdAt,
            updatedAt: timestamp,
            gsi2pk: `METRIC#${metricName}`,
            gsi2sk: `DATE#${report.date}`,
            entityType: 'ANALYTICS_METRIC',
          },
        })
      );
    }

    return report;
  };

  const upsertCounters = async ({
    reportId,
    reportType,
    date,
    deltas = {},
  }) => {
    const timestamp = now().toISOString();
    const metrics = trackedMetrics.filter((metricName) => deltas[metricName] !== undefined);
    const updateParts = [
      'SET reportId = if_not_exists(reportId, :reportId)',
      'reportType = if_not_exists(reportType, :reportType)',
      '#date = if_not_exists(#date, :date)',
      'gsi1pk = :gsi1pk',
      'gsi1sk = :gsi1sk',
      'entityType = if_not_exists(entityType, :entityType)',
      'createdAt = if_not_exists(createdAt, :createdAt)',
      'updatedAt = :updatedAt',
      '#version = if_not_exists(#version, :zero) + :one',
    ];

    const expressionAttributeNames = {
      '#date': 'date',
      '#version': 'version',
    };

    const expressionAttributeValues = {
      ':reportId': reportId,
      ':reportType': reportType,
      ':date': date,
      ':gsi1pk': `DATE#${date}`,
      ':gsi1sk': `REPORT#${reportType}`,
      ':entityType': 'ANALYTICS_REPORT',
      ':createdAt': timestamp,
      ':updatedAt': timestamp,
      ':zero': 0,
      ':one': 1,
    };

    for (const metricName of metrics) {
      updateParts.push(`${metricName} = if_not_exists(${metricName}, :zero) + :${metricName}`);
      expressionAttributeValues[`:${metricName}`] = normalizeNumber(deltas[metricName]);
    }

    await client.send(
      new UpdateCommand({
        TableName: resolveTableName(),
        Key: reportKey(reportType, date),
        UpdateExpression: updateParts.join(', '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    const report = await getReport(reportType, date);
    return syncMetricProjections(report);
  };

  const listByDate = async (date) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        IndexName: 'gsi1',
        KeyConditionExpression: 'gsi1pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `DATE#${date}`,
        },
        ScanIndexForward: true,
      })
    );

    return (result.Items || [])
      .filter((item) => item.entityType === 'ANALYTICS_REPORT')
      .map(toDomain);
  };

  const listMetricHistory = async (metricName) => {
    const result = await client.send(
      new QueryCommand({
        TableName: resolveTableName(),
        IndexName: 'gsi2',
        KeyConditionExpression: 'gsi2pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `METRIC#${metricName}`,
        },
        ScanIndexForward: false,
      })
    );

    return (result.Items || []).map((item) => ({
      reportType: item.reportType,
      date: item.date,
      metricName: item.metricName,
      metricValue: normalizeNumber(item.metricValue),
      updatedAt: item.updatedAt,
    }));
  };

  const removeReport = async (reportType, date) => {
    await client.send(
      new DeleteCommand({
        TableName: resolveTableName(),
        Key: reportKey(reportType, date),
      })
    );
    return true;
  };

  return {
    tableName,
    getReport,
    upsertCounters,
    listByDate,
    listMetricHistory,
    removeReport,
  };
};

const repository = createAnalyticsRepository();

module.exports = repository;
module.exports.createAnalyticsRepository = createAnalyticsRepository;
