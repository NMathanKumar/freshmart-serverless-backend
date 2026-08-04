import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Order } from '../entities/index.js';

type StoredRecord = TableEntity & Order;

export interface Repository {
  list(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  save(entity: Order): Promise<Order>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-order') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async list(): Promise<Order[]> {
    return this.repository.queryByIndex('gsi3', 'gsi3pk', 'ENTITY#ORDER', 'gsi3sk', {
      scanIndexForward: false
    });
  }

  async getById(id: string): Promise<Order | null> {
    const [item] = await this.repository.queryByIndex('gsi1', 'gsi1pk', `ORDER#${id}`, 'gsi1sk', { limit: 1 });
    return item ? (item as Order) : null;
  }

  async save(entity: Order): Promise<Order> {
    await this.repository.put({
      pk: `CUSTOMER#${entity.customerId}`,
      sk: `ORDER#${entity.createdAt}#${entity.orderId}`,
      gsi1pk: `ORDER#${entity.orderId}`,
      gsi1sk: 'METADATA',
      gsi2pk: `STATUS#${entity.status}`,
      gsi2sk: `${entity.createdAt}#${entity.orderId}`,
      gsi3pk: 'ENTITY#ORDER',
      gsi3sk: `${entity.createdAt}#${entity.orderId}`,
      ...entity
    });
    return entity;
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, Order>();

  async list(): Promise<Order[]> {
    return [...this.store.values()];
  }

  async getById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Order): Promise<Order> {
    this.store.set(entity.orderId, entity);
    return entity;
  }
}
