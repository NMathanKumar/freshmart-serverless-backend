import { UpdateCommand, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoRepository, createDocumentClient, type TableEntity } from '@freshmart/platform-core';
import type { Coupon } from '../entities/index.js';

type StoredRecord = TableEntity & Coupon;

export class DynamoCouponRepository {
  private readonly repo: DynamoRepository<StoredRecord>;
  private readonly client = createDocumentClient();
  private readonly tableName: string;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-coupon') {
    this.tableName = tableName;
    this.repo = new DynamoRepository<StoredRecord>(tableName);
  }

  private toStored(item: Coupon): StoredRecord {
    return {
      pk: `COUPON#${item.couponId}`,
      sk: `COUPON#${item.couponId}`,
      gsi1pk: `COUPON#CODE`,
      gsi1sk: item.code,
      ...item
    };
  }

  async list(): Promise<Coupon[]> {
    return this.repo.queryByIndex('gsi1', 'gsi1pk', 'COUPON#CODE');
  }

  async getById(couponId: string): Promise<Coupon | null> {
    return this.repo.get(`COUPON#${couponId}`, `COUPON#${couponId}`);
  }

  async getByCode(code: string): Promise<Coupon | null> {
    const items = await this.repo.queryByIndex('gsi1', 'gsi1pk', 'COUPON#CODE', 'gsi1sk', { beginsWith: code });
    const exact = items.find(i => i.code === code);
    return exact ?? null;
  }

  async save(item: Coupon): Promise<Coupon> {
    await this.repo.put(this.toStored(item));
    return item;
  }

  async getUserUsage(couponId: string, customerId: string): Promise<number> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { pk: `COUPON#${couponId}`, sk: `USER#${customerId}` }
    });
    const result = await this.client.send(command);
    return result.Item?.usageCount ?? 0;
  }

  async incrementUsage(couponId: string, customerId: string, limit?: number, perUserLimit?: number): Promise<void> {
    const transactItems: any[] = [];
    
    transactItems.push({
      Update: {
        TableName: this.tableName,
        Key: { pk: `COUPON#${couponId}`, sk: `COUPON#${couponId}` },
        UpdateExpression: 'SET currentUsage = currentUsage + :inc',
        ConditionExpression: limit ? 'currentUsage < :limit' : undefined,
        ExpressionAttributeValues: limit ? { ':inc': 1, ':limit': limit } : { ':inc': 1 }
      }
    });

    const userExpValues: any = { ':inc': 1, ':zero': 0 };
    if (perUserLimit) {
      userExpValues[':perUserLimit'] = perUserLimit;
    }

    transactItems.push({
      Update: {
        TableName: this.tableName,
        Key: { pk: `COUPON#${couponId}`, sk: `USER#${customerId}` },
        UpdateExpression: 'SET usageCount = if_not_exists(usageCount, :zero) + :inc',
        ConditionExpression: perUserLimit ? 'attribute_not_exists(usageCount) OR usageCount < :perUserLimit' : undefined,
        ExpressionAttributeValues: userExpValues
      }
    });

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });
    
    await this.client.send(command);
  }
}

