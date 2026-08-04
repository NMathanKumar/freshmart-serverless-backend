import { DynamoRepository, createDocumentClient, type TableEntity } from '@freshmart/platform-core';
import type { Delivery } from '../entities/Delivery.js';

type StoredRecord = TableEntity & Delivery;

export class DynamoDeliveryRepository {
  private readonly repo: DynamoRepository<StoredRecord>;
  private readonly tableName: string;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-delivery') {
    this.tableName = tableName;
    this.repo = new DynamoRepository<StoredRecord>(tableName);
  }

  private toStored(item: Delivery): StoredRecord {
    return {
      pk: `ADMIN#DELIVERY`,
      sk: `ITEM#${item.deliveryId}`,
      gsi1pk: `DELIVERY#ORDER`,
      gsi1sk: item.orderId,
      ...item
    };
  }

  async getById(deliveryId: string): Promise<Delivery | null> {
    return this.repo.get(`ADMIN#DELIVERY`, `ITEM#${deliveryId}`);
  }

  async getByOrder(orderId: string): Promise<Delivery[]> {
    return this.repo.queryByIndex('gsi1', 'gsi1pk', 'DELIVERY#ORDER', 'gsi1sk', { beginsWith: orderId });
  }

  async save(item: Delivery): Promise<Delivery> {
    await this.repo.put(this.toStored(item));
    return item;
  }
}
