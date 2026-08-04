import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import type { Role, Permission, RoleMapping } from '../entities/index.js';

export class DynamoIamRepository {
  private docClient: DynamoDBDocumentClient;

  constructor(private readonly tableName: string) {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }

  async listRoles(): Promise<Role[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': 'ROLE#',
        ':sk': '#META#'
      }
    });

    const response = await this.docClient.send(command);
    return (response.Items ?? []).map((item) => ({
      roleName: item.roleName,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async listPermissions(): Promise<Permission[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': 'PERMISSION#',
        ':sk': '#META#'
      }
    });

    const response = await this.docClient.send(command);
    return (response.Items ?? []).map((item) => ({
      permissionName: item.permissionName,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async getRolePermissions(roleName: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `ROLE#${roleName}`,
        ':skPrefix': 'PERMISSION#'
      }
    });

    const response = await this.docClient.send(command);
    return (response.Items ?? []).map((item) => item.permissionName);
  }

  async replaceRolePermissions(roleName: string, permissions: string[]): Promise<void> {
    // 1. Get existing permissions
    const existing = await this.getRolePermissions(roleName);

    // 2. Determine what to add and what to delete
    const toDelete = existing.filter((p) => !permissions.includes(p));
    const toAdd = permissions.filter((p) => !existing.includes(p));

    if (toDelete.length === 0 && toAdd.length === 0) return;

    // 3. Perform batch writes (max 25 per batch)
    const writeRequests: any[] = [];

    const now = new Date().toISOString();

    for (const p of toDelete) {
      writeRequests.push({
        DeleteRequest: {
          Key: {
            PK: `ROLE#${roleName}`,
            SK: `PERMISSION#${p}`
          }
        }
      });
    }

    for (const p of toAdd) {
      writeRequests.push({
        PutRequest: {
          Item: {
            PK: `ROLE#${roleName}`,
            SK: `PERMISSION#${p}`,
            roleName,
            permissionName: p,
            createdAt: now
          }
        }
      });
    }

    // Process batches
    for (let i = 0; i < writeRequests.length; i += 25) {
      const batch = writeRequests.slice(i, i + 25);
      const command = new BatchWriteCommand({
        RequestItems: {
          [this.tableName]: batch
        }
      });
      await this.docClient.send(command);
    }
  }
}
