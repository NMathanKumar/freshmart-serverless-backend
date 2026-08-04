import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DDB_TABLE_WAREHOUSES || 'freshmart-dev-warehouses';

const entityKey = (entityType: string, itemId: string) => ({
  pk: `ADMIN#${entityType}`,
  sk: `ITEM#${itemId}`,
});

export const adminRepository = {
  async createEntity(entityType: string, itemId: string, data: any, status = 'ACTIVE', createdBy = 'system') {
    const timestamp = new Date().toISOString();
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

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
    );

    return item;
  },

  async getEntity(entityType: string, itemId: string) {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: entityKey(entityType, itemId),
      })
    );
    return result.Item || null;
  },

  async saveEntity(entityType: string, itemId: string, data: any, status = 'ACTIVE', createdBy = 'system') {
    const current = await this.getEntity(entityType, itemId);
    const timestamp = new Date().toISOString();

    if (!current) {
      return this.createEntity(entityType, itemId, data, status, createdBy);
    }

    const nextVersion = Number(current.version || 0) + 1;
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
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

    return result.Attributes;
  }
};
