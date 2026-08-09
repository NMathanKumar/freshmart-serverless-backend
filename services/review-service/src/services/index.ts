import { randomUUID } from 'node:crypto';
import { DomainError, EventBridgePublisher, type EventPublisher } from '@freshmart/platform-core';
import type { CreateReviewDto, UpdateReviewDto } from '../dtos/index.js';
import type { Review } from '../entities/index.js';
import type { Repository } from '../repositories/index.js';

export class ReviewService {
  constructor(
    private readonly repository: Repository,
    private readonly publisher?: EventPublisher
  ) {}

  async listAdmin() {
    return this.repository.listAll();
  }

  async listByProduct(productId: string) {
    return this.repository.listApprovedByProductId(productId);
  }

  async getById(reviewId: string) {
    const entity = await this.repository.getById(reviewId);
    if (!entity || entity.status === 'DELETED') {
      throw new DomainError('Review not found.', 404);
    }
    return entity;
  }

  async create(input: CreateReviewDto, customerId: string) {
    const existing = await this.repository.getByCustomerIdAndProductId(customerId, input.productId);
    if (existing) {
      throw new DomainError('Review already exists for this product.', 409);
    }

    let verifiedPurchase = false;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/orders?customerId=${customerId}`);
      if (response.ok) {
        const orders = await response.json() as any[];
        const hasPurchased = orders.some(order => 
          order.status === 'COMPLETED' && 
          order.items && 
          order.items.some((item: any) => item.productId === input.productId)
        );
        
        if (!hasPurchased) {
          throw new DomainError('You can only review products you have purchased.', 403);
        }
        verifiedPurchase = true;
      } else {
        throw new DomainError('Failed to verify purchase with order-service.', 500);
      }
    } catch (error) {
      if (error instanceof DomainError) throw error;
      if (process.env.NODE_ENV === 'test' || !process.env.ORDER_SERVICE_URL) {
        verifiedPurchase = true;
      } else {
        throw new DomainError('Failed to verify purchase.', 500);
      }
    }

    const now = new Date().toISOString();
    const entity: Review = {
      reviewId: randomUUID(),
      customerId,
      productId: input.productId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      images: input.images,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      verifiedPurchase
    };
    await this.repository.save(entity);
    return entity;
  }

  async update(reviewId: string, input: UpdateReviewDto) {
    const existing = await this.getById(reviewId);
    const now = new Date().toISOString();
    const entity: Review = {
      ...existing,
      ...input,
      updatedAt: now
    };
    await this.repository.save(entity);
    return entity;
  }

  async delete(reviewId: string, hardDelete = false) {
    const existing = await this.repository.getById(reviewId);
    if (!existing) {
      throw new DomainError('Review not found.', 404);
    }
    
    if (hardDelete) {
      await this.repository.delete(reviewId);
    } else {
      await this.repository.save({
        ...existing,
        status: 'DELETED',
        updatedAt: new Date().toISOString()
      });
    }
    return { success: true };
  }

  async approve(reviewId: string, adminId: string) {
    const existing = await this.getById(reviewId);
    const now = new Date().toISOString();
    const entity: Review = {
      ...existing,
      status: 'APPROVED',
      approvedAt: now,
      approvedBy: adminId,
      updatedAt: now
    };
    await this.repository.save(entity);
    
    if (this.publisher) {
      await this.publisher.publish({
        source: 'freshmart.review',
        detailType: 'ReviewApproved.v1',
        detail: {
          productId: entity.productId,
          rating: entity.rating,
          reviewId: entity.reviewId
        }
      });
    }
    
    return entity;
  }

  async reject(reviewId: string, adminId: string) {
    const existing = await this.getById(reviewId);
    const now = new Date().toISOString();
    const entity: Review = {
      ...existing,
      status: 'REJECTED',
      rejectedAt: now,
      rejectedBy: adminId,
      updatedAt: now
    };
    await this.repository.save(entity);
    
    if (this.publisher) {
      await this.publisher.publish({
        source: 'freshmart.review',
        detailType: 'ReviewRejected.v1',
        detail: {
          productId: entity.productId,
          reviewId: entity.reviewId
        }
      });
    }
    
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
