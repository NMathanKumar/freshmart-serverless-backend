const { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const adminRepo = require('./admin.repository');
const { genId } = require('@freshmart/service-shared').utils.id;

const tableName = adminRepo.tableName || config.dynamodb.tables.admin || process.env.DDB_TABLE_ADMIN || 'freshmart-dev-admin';
const ENTITY_TYPE = 'VENDOR_INVOICE';

const key = (itemId) => ({
  pk: `ADMIN#${ENTITY_TYPE}`,
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

const createInvoice = async (data, context = {}) => {
  const now = new Date().toISOString();
  const invoiceId = genId('INV');

  const item = {
    ...key(invoiceId),
    adminItemId: invoiceId,
    entityType: ENTITY_TYPE,
    data: {
      invoiceId,
      ...data,
    },
    status: data.status || 'DRAFT',
    createdAt: now,
    updatedAt: now,
    createdBy: context.userId || 'system',
    version: 0,
    // Standard generic GSIs
    gsi1pk: `TYPE#${ENTITY_TYPE}`,
    gsi1sk: `UPDATED#${now}`,
    gsi2pk: `STATUS#${data.status || 'DRAFT'}`,
    gsi2sk: `UPDATED#${now}`,
    // Custom GSIs for Vendor Invoice
    gsi3pk: `SUPPLIER#${data.supplierId}`,
    gsi3sk: `INVOICE_NUM#${data.invoiceNumber}`,
    gsi4pk: `PO#${data.purchaseOrderId}`,
    gsi4sk: `UPDATED#${now}`,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    })
  );

  return toDomain(item);
};

const getInvoice = async (invoiceId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName,
      Key: key(invoiceId),
    })
  );
  return toDomain(result.Item || null);
};

const checkInvoiceNumberExists = async (supplierId, invoiceNumber) => {
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: 'gsi3',
      KeyConditionExpression: 'gsi3pk = :supplierPk AND gsi3sk = :invoiceNumSk',
      ExpressionAttributeValues: {
        ':supplierPk': `SUPPLIER#${supplierId}`,
        ':invoiceNumSk': `INVOICE_NUM#${invoiceNumber}`,
      },
      Limit: 1,
    })
  );
  return (result.Items && result.Items.length > 0);
};

const saveInvoice = async (invoiceId, data, currentStatus, expectedVersion, context = {}) => {
  const now = new Date().toISOString();
  const nextVersion = Number(expectedVersion || 0) + 1;

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key(invoiceId),
      UpdateExpression: `
        SET data = :data, 
            #status = :status, 
            updatedAt = :updatedAt, 
            gsi1pk = :gsi1pk, 
            gsi1sk = :gsi1sk, 
            gsi2pk = :gsi2pk, 
            gsi2sk = :gsi2sk, 
            gsi3pk = :gsi3pk, 
            gsi3sk = :gsi3sk, 
            gsi4pk = :gsi4pk, 
            gsi4sk = :gsi4sk, 
            #version = :nextVersion
      `,
      ConditionExpression: '#version = :expectedVersion',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#version': 'version',
      },
      ExpressionAttributeValues: {
        ':data': data,
        ':status': currentStatus,
        ':updatedAt': now,
        ':gsi1pk': `TYPE#${ENTITY_TYPE}`,
        ':gsi1sk': `UPDATED#${now}`,
        ':gsi2pk': `STATUS#${currentStatus}`,
        ':gsi2sk': `UPDATED#${now}`,
        ':gsi3pk': `SUPPLIER#${data.supplierId}`,
        ':gsi3sk': `INVOICE_NUM#${data.invoiceNumber}`,
        ':gsi4pk': `PO#${data.purchaseOrderId}`,
        ':gsi4sk': `UPDATED#${now}`,
        ':expectedVersion': Number(expectedVersion || 0),
        ':nextVersion': nextVersion,
      },
      ReturnValues: 'ALL_NEW',
    })
  );

  return toDomain(result.Attributes || null);
};

const listInvoices = async ({ supplierId, purchaseOrderId, status, page = 1, limit = 20 }) => {
  let command;
  if (supplierId) {
    command = new QueryCommand({
      TableName: tableName,
      IndexName: 'gsi3',
      KeyConditionExpression: 'gsi3pk = :supplierPk',
      ExpressionAttributeValues: { ':supplierPk': `SUPPLIER#${supplierId}` },
      ScanIndexForward: false,
    });
  } else if (purchaseOrderId) {
    command = new QueryCommand({
      TableName: tableName,
      IndexName: 'gsi4',
      KeyConditionExpression: 'gsi4pk = :poPk',
      ExpressionAttributeValues: { ':poPk': `PO#${purchaseOrderId}` },
      ScanIndexForward: false,
    });
  } else if (status) {
    command = new QueryCommand({
      TableName: tableName,
      IndexName: 'gsi2',
      KeyConditionExpression: 'gsi2pk = :statusPk',
      ExpressionAttributeValues: { ':statusPk': `STATUS#${status}` },
      ScanIndexForward: false,
    });
  } else {
    command = new QueryCommand({
      TableName: tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :typePk',
      ExpressionAttributeValues: { ':typePk': `TYPE#${ENTITY_TYPE}` },
      ScanIndexForward: false,
    });
  }

  const result = await documentClient.send(command);
  let items = (result.Items || []).map(toDomain);

  // In-memory filters if multiple were provided
  if (supplierId && purchaseOrderId) items = items.filter(i => i.data.purchaseOrderId === purchaseOrderId);
  if (status && (supplierId || purchaseOrderId)) items = items.filter(i => i.status === status || i.data.status === status);

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
    page: safePage,
    limit: safeLimit,
  };
};

module.exports = {
  createInvoice,
  getInvoice,
  saveInvoice,
  listInvoices,
  checkInvoiceNumberExists,
};
