import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { UpsertPromotionDto } from '../dtos/index.js';
import type { Promotion } from '../entities/index.js';
import type { PromotionsRepository } from '../repositories/index.js';

export class PromotionsService {
  constructor(private readonly repository: PromotionsRepository) {}

  async list(): Promise<Promotion[]> { return this.repository.list(); }

  async getById(promotionId: string): Promise<Promotion> {
    const promotion = await this.repository.getById(promotionId);
    if (!promotion) throw new DomainError('Promotion not found.', 404);
    return promotion;
  }

  async upsert(input: UpsertPromotionDto): Promise<Promotion> {
    const now = new Date().toISOString();
    const promotion: Promotion = {
      promotionId: input.promotionId ?? randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input
    };
    return this.repository.save(promotion);
  }
}
