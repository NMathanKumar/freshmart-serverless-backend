import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Promotion } from '../entities/index.js';

type PromotionRecord = TableEntity & Promotion;

export interface PromotionsRepository {
  list(): Promise<Promotion[]>;
  getById(promotionId: string): Promise<Promotion | null>;
  save(promotion: Promotion): Promise<Promotion>;
}

export class DynamoPromotionsRepository implements PromotionsRepository {
  private readonly repository: DynamoRepository<PromotionRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-promotions-service') {
    this.repository = new DynamoRepository<PromotionRecord>(tableName);
  }

  async list(): Promise<Promotion[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#PROMOTION', 'gsi1sk', { scanIndexForward: false });
  }

  async getById(promotionId: string): Promise<Promotion | null> {
    const item = await this.repository.get(`PROMOTION#${promotionId}`, 'METADATA');
    return item ? (item as Promotion) : null;
  }

  async save(promotion: Promotion): Promise<Promotion> {
    await this.repository.put({
      pk: `PROMOTION#${promotion.promotionId}`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#PROMOTION',
      gsi1sk: `${promotion.startsAt}#${promotion.promotionId}`,
      gsi2pk: `CODE#${promotion.code.toUpperCase()}`,
      gsi2sk: 'METADATA',
      ...promotion
    });
    return promotion;
  }
}

export class InMemoryPromotionsRepository implements PromotionsRepository {
  private readonly promotions = new Map<string, Promotion>();
  async list(): Promise<Promotion[]> { return [...this.promotions.values()]; }
  async getById(promotionId: string): Promise<Promotion | null> { return this.promotions.get(promotionId) ?? null; }
  async save(promotion: Promotion): Promise<Promotion> { this.promotions.set(promotion.promotionId, promotion); return promotion; }
}
