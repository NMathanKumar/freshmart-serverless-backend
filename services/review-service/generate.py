import os

base_path = r"c:\Users\mathankumar.n\Downloads\projects\freshmart-serverless-backend\services\review-service"

files = {
    "src/entities/index.ts": """export interface Review {
  reviewId: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  images?: string[];
  verifiedPurchase?: boolean;
}
""",
    "src/dtos/index.ts": """import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).optional()
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED']).optional()
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
""",
    "src/validators/index.ts": """export { createReviewSchema, updateReviewSchema } from '../dtos/index.js';
""",
    "src/repositories/index.ts": """import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Review } from '../entities/index.js';

type StoredRecord = TableEntity & Review;

export interface Repository {
  listAll(): Promise<Review[]>;
  listApprovedByProductId(productId: string): Promise<Review[]>;
  getById(id: string): Promise<Review | null>;
  save(entity: Review): Promise<Review>;
  delete(id: string): Promise<void>;
}

export class DynamoStoreRepository implements Repository {
  private readonly repository: DynamoRepository<StoredRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-review') {
    this.repository = new DynamoRepository<StoredRecord>(tableName);
  }

  async listAll(): Promise<Review[]> {
    return this.repository.queryByIndex('gsi3', 'gsi3pk', 'ENTITY#REVIEW');
  }

  async listApprovedByProductId(productId: string): Promise<Review[]> {
    const all = await this.repository.queryByIndex('gsi1', 'gsi1pk', `PRODUCT#${productId}`);
    return all.filter(r => r.status === 'APPROVED');
  }

  async getById(id: string): Promise<Review | null> {
    const item = await this.repository.get(`REVIEW#${id}`, 'METADATA');
    return item ? (item as Review) : null;
  }

  async save(entity: Review): Promise<Review> {
    await this.repository.put({
      pk: `REVIEW#${entity.reviewId}`,
      sk: 'METADATA',
      gsi1pk: `PRODUCT#${entity.productId}`,
      gsi1sk: `CREATEDAT#${entity.createdAt}`,
      gsi2pk: `CUSTOMER#${entity.customerId}`,
      gsi2sk: `CREATEDAT#${entity.createdAt}`,
      gsi3pk: `ENTITY#REVIEW`,
      gsi3sk: `STATUS#${entity.status}#CREATEDAT#${entity.createdAt}`,
      ...entity
    });
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(`REVIEW#${id}`, 'METADATA');
  }
}

export class InMemoryRepository implements Repository {
  private readonly store = new Map<string, Review>();

  async listAll(): Promise<Review[]> {
    return [...this.store.values()];
  }

  async listApprovedByProductId(productId: string): Promise<Review[]> {
    return [...this.store.values()].filter(r => r.productId === productId && r.status === 'APPROVED');
  }

  async getById(id: string): Promise<Review | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Review): Promise<Review> {
    this.store.set(entity.reviewId, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
""",
    "src/services/index.ts": """import { randomUUID } from 'node:crypto';
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
      verifiedPurchase: false
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
    return entity;
  }
}

export const createEventPublisher = () =>
  process.env.EVENT_BUS_NAME ? new EventBridgePublisher(process.env.EVENT_BUS_NAME) : undefined;
""",
    "src/controllers/index.ts": """import { jsonResponse, validate } from '@freshmart/platform-core';
import { createReviewSchema, updateReviewSchema } from '../dtos/index.js';
import type { ReviewService } from '../services/index.js';

export const createController = (service: ReviewService) => ({
  listByProduct: async (productId: string) => jsonResponse(200, await service.listByProduct(productId)),
  listAdmin: async () => jsonResponse(200, await service.listAdmin()),
  getById: async (reviewId: string) => jsonResponse(200, await service.getById(reviewId)),
  create: async (body: unknown, customerId: string) => jsonResponse(201, await service.create(validate(createReviewSchema, body), customerId)),
  update: async (reviewId: string, body: unknown) => jsonResponse(200, await service.update(reviewId, validate(updateReviewSchema, body))),
  delete: async (reviewId: string, hardDelete: boolean) => jsonResponse(200, await service.delete(reviewId, hardDelete)),
  approve: async (reviewId: string, adminId: string) => jsonResponse(200, await service.approve(reviewId, adminId)),
  reject: async (reviewId: string, adminId: string) => jsonResponse(200, await service.reject(reviewId, adminId))
});
""",
    "src/routes/index.ts": """import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { ReviewService, createEventPublisher } from '../services/index.js';

const config = loadConfig('review-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new ReviewService(new DynamoStoreRepository(config.TABLE_NAME), createEventPublisher()));

export const routes: RouteDefinition[] = [
  // Customer GET / (with productId query param)
  {
    method: 'GET',
    path: '/api/v1/reviews',
    authorize: true,
    handler: ({ query }) => {
      const productId = query?.productId;
      if (!productId) return { statusCode: 400, body: JSON.stringify({ message: 'productId query param is required' }) };
      return controller.listByProduct(productId);
    }
  },
  // Customer GET /:reviewId
  {
    method: 'GET',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    handler: ({ params }) => controller.getById(params.reviewId)
  },
  // Customer POST /
  {
    method: 'POST',
    path: '/api/v1/reviews',
    authorize: true,
    handler: ({ body, auth }) => {
      if (!auth?.subject) return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
      return controller.create(body, auth.subject);
    }
  },
  // Admin GET /admin
  {
    method: 'GET',
    path: '/api/v1/reviews/admin',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: () => controller.listAdmin()
  },
  // Admin PUT /:reviewId
  {
    method: 'PUT',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, body }) => controller.update(params.reviewId, body)
  },
  // Admin DELETE /:reviewId
  {
    method: 'DELETE',
    path: '/api/v1/reviews/:reviewId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, query }) => controller.delete(params.reviewId, query?.hard === 'true')
  },
  // Admin POST /:reviewId/approve
  {
    method: 'POST',
    path: '/api/v1/reviews/:reviewId/approve',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, auth }) => controller.approve(params.reviewId, auth?.subject || 'admin')
  },
  // Admin POST /:reviewId/reject
  {
    method: 'POST',
    path: '/api/v1/reviews/:reviewId/reject',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, auth }) => controller.reject(params.reviewId, auth?.subject || 'admin')
  }
];

export const handler = createLambdaHandler({
  serviceName: 'review-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
""",
    "test/service.test.ts": """import assert from 'node:assert/strict';
import test from 'node:test';
import { ReviewService } from '../src/services/index.js';
import { InMemoryRepository } from '../src/repositories/index.js';

test('review service manages reviews correctly', async () => {
  const service = new ReviewService(new InMemoryRepository());
  const created = await service.create({
    productId: 'prod-123',
    rating: 5,
    title: 'Great product',
    comment: 'I loved it'
  }, 'cust-456');

  assert.equal(created.status, 'PENDING');
  assert.equal(created.productId, 'prod-123');

  const loaded = await service.getById(created.reviewId);
  assert.deepEqual(loaded, created);

  const approved = await service.approve(created.reviewId, 'admin-1');
  assert.equal(approved.status, 'APPROVED');

  const rejected = await service.reject(created.reviewId, 'admin-2');
  assert.equal(rejected.status, 'REJECTED');

  await service.delete(created.reviewId);
  
  await assert.rejects(
    async () => service.getById(created.reviewId),
    { message: 'Review not found.' }
  );
});
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_path, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
