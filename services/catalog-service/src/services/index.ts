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
    const productId = input.productId || input.id || `PROD_${randomUUID().substring(0, 8)}`;
    const nameStr = input.productName || input.name || 'Fresh Product';
    const categoryStr = input.category || input.categoryId || 'Fresh Produce';
    const priceVal = typeof input.price === 'number' ? input.price : 0;
    const stockVal = typeof input.stock === 'number' ? input.stock : 0;

    const entity: any = {
      productId,
      id: productId,
      productName: nameStr,
      name: nameStr,
      category: categoryStr,
      categoryId: categoryStr,
      price: priceVal,
      stock: stockVal,
      available: input.available ?? (input.availability !== 'OUT_OF_STOCK'),
      sku: input.sku || `SKU-${productId.substring(0, 8).toUpperCase()}`,
      description: input.description || 'Fresh organic product delivered straight from local farms.',
      images: Array.isArray(input.images) && input.images.length > 0 ? input.images : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80'],
      ...input,
      rating: input.rating ?? 0,
      variants: Array.isArray(input.variants)
        ? input.variants.map((variant: any) => ({
            ...variant,
            variantId: variant?.variantId ?? randomUUID()
          }))
        : [],
      createdAt: now,
      updatedAt: now
    };
    await this.repository.save(entity);
    try {
      await this.publisher?.publish({
        source: 'freshmart.catalog',
        detailType: 'freshmart.catalog.product_upserted',
        detail: entity
      });
    } catch {
      // Event bridge publish failure shouldn't fail product creation
    }
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
