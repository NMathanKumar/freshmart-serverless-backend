import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { UpsertDto } from '../dtos/index.js';
import type { CatalogProduct } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class CatalogService {
  constructor(
    private readonly repository: Repository,
    private readonly publisher?: EventPublisher
  ) {}

  async list() {
    return this.repository.list();
  }

  async getById(entityId: string) {
    const entity = await this.repository.getById(entityId);
    if (!entity) {
      throw new DomainError('Catalog product not found.', 404);
    }
    return entity;
  }

  async upsert(input: UpsertDto) {
    const now = new Date().toISOString();
    const entity: CatalogProduct = {
      productId: input.productId ?? randomUUID(),
      ...input,
      rating: input.rating ?? 0,
      variants: input.variants.map((variant) => ({
        ...variant,
        variantId: variant.variantId ?? randomUUID()
      })),
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    await this.publisher?.publish({
      source: 'freshmart.catalog',
      detailType: 'freshmart.catalog.product_upserted',
      detail: entity
    });
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
