import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const write = (relativePath, content) => {
  const absolutePath = resolve(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content.trimStart(), 'utf8');
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const createPackageJson = (name) =>
  json({
    name,
    version: '1.0.0',
    private: true,
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc -b',
      typecheck: 'tsc -b --pretty false',
      test: 'node --test --import tsx test/service.test.ts'
    },
    dependencies: {
      '@freshmart/platform-core': 'file:../../packages/platform-core',
      zod: '^3.25.76'
    }
  });

const tsconfig = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [{ "path": "../../packages/platform-core" }],
  "include": ["src/**/*.ts"]
}
`;

const services = [
  {
    folder: 'wishlist-service',
    packageName: '@freshmart/wishlist-service',
    className: 'WishlistService',
    entity: `export interface WishlistItem {
  wishlistItemId: string;
  customerId: string;
  productId: string;
  sku: string;
  productName: string;
  addedAt: string;
}
`,
    dto: `import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  wishlistItemId: z.string().uuid().optional(),
  customerId: z.string().min(1).max(80),
  productId: z.string().min(1).max(80),
  sku: z.string().min(1).max(80),
  productName: z.string().min(1).max(160)
});

export const customerPathSchema = z.object({
  customerId: z.string().min(1).max(80)
});

export const removeWishlistItemSchema = z.object({
  customerId: z.string().min(1).max(80),
  wishlistItemId: z.string().uuid()
});

export type AddWishlistItemDto = z.infer<typeof addWishlistItemSchema>;
export type RemoveWishlistItemDto = z.infer<typeof removeWishlistItemSchema>;
`,
    repository: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { WishlistItem } from '../entities/index.js';

type WishlistRecord = TableEntity & WishlistItem;

export interface WishlistRepository {
  listByCustomer(customerId: string): Promise<WishlistItem[]>;
  save(item: WishlistItem): Promise<WishlistItem>;
  delete(customerId: string, wishlistItemId: string): Promise<void>;
}

export class DynamoWishlistRepository implements WishlistRepository {
  private readonly repository: DynamoRepository<WishlistRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-wishlist-service') {
    this.repository = new DynamoRepository<WishlistRecord>(tableName);
  }

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return this.repository.query(\`CUSTOMER#\${customerId}\`, 'ITEM#');
  }

  async save(item: WishlistItem): Promise<WishlistItem> {
    await this.repository.put({
      pk: \`CUSTOMER#\${item.customerId}\`,
      sk: \`ITEM#\${item.wishlistItemId}\`,
      gsi1pk: 'ENTITY#WISHLIST_ITEM',
      gsi1sk: \`\${item.addedAt}#\${item.wishlistItemId}\`,
      ...item
    });
    return item;
  }

  async delete(): Promise<void> {}
}

export class InMemoryWishlistRepository implements WishlistRepository {
  private readonly items = new Map<string, WishlistItem>();

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return [...this.items.values()].filter((item) => item.customerId === customerId);
  }

  async save(item: WishlistItem): Promise<WishlistItem> {
    this.items.set(item.wishlistItemId, item);
    return item;
  }

  async delete(customerId: string, wishlistItemId: string): Promise<void> {
    const item = this.items.get(wishlistItemId);
    if (item?.customerId === customerId) {
      this.items.delete(wishlistItemId);
    }
  }
}
`,
    service: `import { randomUUID } from 'node:crypto';
import type { WishlistItem } from '../entities/index.js';
import type { WishlistRepository } from '../repositories/index.js';

export class WishlistService {
  constructor(private readonly repository: WishlistRepository) {}

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return this.repository.listByCustomer(customerId);
  }

  async add(input: Omit<WishlistItem, 'wishlistItemId' | 'addedAt'> & Partial<Pick<WishlistItem, 'wishlistItemId'>>): Promise<WishlistItem> {
    const item: WishlistItem = {
      wishlistItemId: input.wishlistItemId ?? randomUUID(),
      addedAt: new Date().toISOString(),
      ...input
    };
    return this.repository.save(item);
  }

  async remove(customerId: string, wishlistItemId: string): Promise<void> {
    await this.repository.delete(customerId, wishlistItemId);
  }
}
`,
    controller: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { addWishlistItemSchema, removeWishlistItemSchema } from '../dtos/index.js';
import type { WishlistService } from '../services/index.js';

export const createWishlistController = (service: WishlistService) => ({
  list: async (customerId: string) => jsonResponse(200, await service.listByCustomer(customerId)),
  add: async (body: unknown) => jsonResponse(201, await service.add(validate(addWishlistItemSchema, body))),
  remove: async (body: unknown) => {
    const input = validate(removeWishlistItemSchema, body);
    await service.remove(input.customerId, input.wishlistItemId);
    return jsonResponse(204, null);
  }
});
`,
    routes: `import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createWishlistController } from '../controllers/index.js';
import { DynamoWishlistRepository } from '../repositories/index.js';
import { WishlistService } from '../services/index.js';

const config = loadConfig('wishlist-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createWishlistController(new WishlistService(new DynamoWishlistRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/wishlist/:customerId',
    authorize: true,
    handler: ({ params }) => controller.list(params.customerId)
  },
  {
    method: 'POST',
    path: '/api/v1/wishlist/items',
    authorize: true,
    handler: ({ body }) => controller.add(body)
  },
  {
    method: 'DELETE',
    path: '/api/v1/wishlist/items',
    authorize: true,
    handler: ({ body }) => controller.remove(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'wishlist-service',
  routes,
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryWishlistRepository } from '../src/repositories/index.js';
import { WishlistService } from '../src/services/index.js';

test('wishlist service stores and returns customer wishlist items', async () => {
  const service = new WishlistService(new InMemoryWishlistRepository());
  await service.add({
    customerId: 'customer-1',
    productId: 'prod-1',
    sku: 'BANANA-1KG',
    productName: 'Organic Banana'
  });

  const items = await service.listByCustomer('customer-1');
  assert.equal(items.length, 1);
});
`
  },
  {
    folder: 'promotions-service',
    packageName: '@freshmart/promotions-service',
    className: 'PromotionsService',
    entity: `export interface Promotion {
  promotionId: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
`,
    dto: `import { z } from 'zod';

export const upsertPromotionSchema = z.object({
  promotionId: z.string().uuid().optional(),
  code: z.string().min(3).max(32),
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(500),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true)
});

export type UpsertPromotionDto = z.infer<typeof upsertPromotionSchema>;
`,
    repository: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
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
    const item = await this.repository.get(\`PROMOTION#\${promotionId}\`, 'METADATA');
    return item ? (item as Promotion) : null;
  }

  async save(promotion: Promotion): Promise<Promotion> {
    await this.repository.put({
      pk: \`PROMOTION#\${promotion.promotionId}\`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#PROMOTION',
      gsi1sk: \`\${promotion.startsAt}#\${promotion.promotionId}\`,
      gsi2pk: \`CODE#\${promotion.code.toUpperCase()}\`,
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
`,
    service: `import { randomUUID } from 'node:crypto';
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
`,
    controller: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertPromotionSchema } from '../dtos/index.js';
import type { PromotionsService } from '../services/index.js';

export const createPromotionsController = (service: PromotionsService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (promotionId: string) => jsonResponse(200, await service.getById(promotionId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertPromotionSchema, body)))
});
`,
    routes: `import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createPromotionsController } from '../controllers/index.js';
import { DynamoPromotionsRepository } from '../repositories/index.js';
import { PromotionsService } from '../services/index.js';

const config = loadConfig('promotions-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createPromotionsController(new PromotionsService(new DynamoPromotionsRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/promotions', authorize: true, handler: () => controller.list() },
  { method: 'GET', path: '/api/v1/promotions/:promotionId', authorize: true, handler: ({ params }) => controller.getById(params.promotionId) },
  { method: 'POST', path: '/api/v1/promotions', authorize: true, roles: ['admin', 'operations'], handler: ({ body }) => controller.upsert(body) }
];

export const handler = createLambdaHandler({
  serviceName: 'promotions-service',
  routes,
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryPromotionsRepository } from '../src/repositories/index.js';
import { PromotionsService } from '../src/services/index.js';

test('promotions service stores active promotions', async () => {
  const service = new PromotionsService(new InMemoryPromotionsRepository());
  const promotion = await service.upsert({
    code: 'WELCOME10',
    title: 'Welcome Offer',
    description: 'Discount for first order',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
    isActive: true
  });
  assert.equal(promotion.code, 'WELCOME10');
});
`
  },
  {
    folder: 'brand-service',
    packageName: '@freshmart/brand-service',
    className: 'BrandService',
    entity: `export interface Brand {
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
`,
    dto: `import { z } from 'zod';

export const upsertBrandSchema = z.object({
  brandId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().default(true)
});

export type UpsertBrandDto = z.infer<typeof upsertBrandSchema>;
`,
    repository: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Brand } from '../entities/index.js';

type BrandRecord = TableEntity & Brand;

export interface BrandRepository {
  list(): Promise<Brand[]>;
  getById(brandId: string): Promise<Brand | null>;
  save(brand: Brand): Promise<Brand>;
}

export class DynamoBrandRepository implements BrandRepository {
  private readonly repository: DynamoRepository<BrandRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-brand-service') {
    this.repository = new DynamoRepository<BrandRecord>(tableName);
  }
  async list(): Promise<Brand[]> { return this.repository.queryByIndex('gsi1', 'gsi1pk', 'ENTITY#BRAND', 'gsi1sk'); }
  async getById(brandId: string): Promise<Brand | null> {
    const item = await this.repository.get(\`BRAND#\${brandId}\`, 'METADATA');
    return item ? (item as Brand) : null;
  }
  async save(brand: Brand): Promise<Brand> {
    await this.repository.put({
      pk: \`BRAND#\${brand.brandId}\`,
      sk: 'METADATA',
      gsi1pk: 'ENTITY#BRAND',
      gsi1sk: brand.slug,
      gsi2pk: \`SLUG#\${brand.slug}\`,
      gsi2sk: 'METADATA',
      ...brand
    });
    return brand;
  }
}

export class InMemoryBrandRepository implements BrandRepository {
  private readonly brands = new Map<string, Brand>();
  async list(): Promise<Brand[]> { return [...this.brands.values()]; }
  async getById(brandId: string): Promise<Brand | null> { return this.brands.get(brandId) ?? null; }
  async save(brand: Brand): Promise<Brand> { this.brands.set(brand.brandId, brand); return brand; }
}
`,
    service: `import { randomUUID } from 'node:crypto';
import { DomainError } from '@freshmart/platform-core';
import type { UpsertBrandDto } from '../dtos/index.js';
import type { Brand } from '../entities/index.js';
import type { BrandRepository } from '../repositories/index.js';

export class BrandService {
  constructor(private readonly repository: BrandRepository) {}
  async list(): Promise<Brand[]> { return this.repository.list(); }
  async getById(brandId: string): Promise<Brand> {
    const brand = await this.repository.getById(brandId);
    if (!brand) throw new DomainError('Brand not found.', 404);
    return brand;
  }
  async upsert(input: UpsertBrandDto): Promise<Brand> {
    const now = new Date().toISOString();
    return this.repository.save({
      brandId: input.brandId ?? randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input
    });
  }
}
`,
    controller: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertBrandSchema } from '../dtos/index.js';
import type { BrandService } from '../services/index.js';

export const createBrandController = (service: BrandService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (brandId: string) => jsonResponse(200, await service.getById(brandId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertBrandSchema, body)))
});
`,
    routes: `import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createBrandController } from '../controllers/index.js';
import { DynamoBrandRepository } from '../repositories/index.js';
import { BrandService } from '../services/index.js';

const config = loadConfig('brand-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});
const controller = createBrandController(new BrandService(new DynamoBrandRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/brands', authorize: true, handler: () => controller.list() },
  { method: 'GET', path: '/api/v1/brands/:brandId', authorize: true, handler: ({ params }) => controller.getById(params.brandId) },
  { method: 'POST', path: '/api/v1/brands', authorize: true, roles: ['admin', 'catalog-manager'], handler: ({ body }) => controller.upsert(body) }
];
export const handler = createLambdaHandler({
  serviceName: 'brand-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryBrandRepository } from '../src/repositories/index.js';
import { BrandService } from '../src/services/index.js';

test('brand service upserts brands', async () => {
  const service = new BrandService(new InMemoryBrandRepository());
  const brand = await service.upsert({ name: 'FreshMart Select', slug: 'freshmart-select', isActive: true });
  assert.equal(brand.slug, 'freshmart-select');
});
`
  },
  {
    folder: 'search-service',
    packageName: '@freshmart/search-service',
    className: 'SearchService',
    entity: `export interface SearchDocument {
  documentId: string;
  documentType: 'product' | 'brand' | 'category' | 'cms';
  title: string;
  slug: string;
  summary?: string;
  searchTerm: string;
  score: number;
  updatedAt: string;
}
`,
    dto: `import { z } from 'zod';

export const upsertSearchDocumentSchema = z.object({
  documentId: z.string().uuid().optional(),
  documentType: z.enum(['product', 'brand', 'category', 'cms']),
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  summary: z.string().max(300).optional(),
  searchTerm: z.string().min(1).max(160),
  score: z.number().min(0).default(0)
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(160)
});

export type UpsertSearchDocumentDto = z.infer<typeof upsertSearchDocumentSchema>;
`,
    repository: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { SearchDocument } from '../entities/index.js';

type SearchRecord = TableEntity & SearchDocument;

export interface SearchRepository {
  search(term: string): Promise<SearchDocument[]>;
  save(document: SearchDocument): Promise<SearchDocument>;
}

export class DynamoSearchRepository implements SearchRepository {
  private readonly repository: DynamoRepository<SearchRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-search-service') {
    this.repository = new DynamoRepository<SearchRecord>(tableName);
  }
  async search(term: string): Promise<SearchDocument[]> {
    return this.repository.queryByIndex('gsi1', 'gsi1pk', \`TERM#\${term.trim().toLowerCase()}\`, 'gsi1sk', { scanIndexForward: false });
  }
  async save(document: SearchDocument): Promise<SearchDocument> {
    await this.repository.put({
      pk: \`DOC#\${document.documentId}\`,
      sk: 'METADATA',
      gsi1pk: \`TERM#\${document.searchTerm.trim().toLowerCase()}\`,
      gsi1sk: \`\${String(document.score).padStart(8, '0')}#\${document.documentId}\`,
      ...document
    });
    return document;
  }
}

export class InMemorySearchRepository implements SearchRepository {
  private readonly docs = new Map<string, SearchDocument>();
  async search(term: string): Promise<SearchDocument[]> {
    return [...this.docs.values()].filter((doc) => doc.searchTerm.toLowerCase() === term.toLowerCase());
  }
  async save(document: SearchDocument): Promise<SearchDocument> { this.docs.set(document.documentId, document); return document; }
}
`,
    service: `import { randomUUID } from 'node:crypto';
import type { UpsertSearchDocumentDto } from '../dtos/index.js';
import type { SearchDocument } from '../entities/index.js';
import type { SearchRepository } from '../repositories/index.js';

export class SearchService {
  constructor(private readonly repository: SearchRepository) {}
  async search(term: string): Promise<SearchDocument[]> { return this.repository.search(term); }
  async upsert(input: UpsertSearchDocumentDto): Promise<SearchDocument> {
    return this.repository.save({
      documentId: input.documentId ?? randomUUID(),
      updatedAt: new Date().toISOString(),
      ...input
    });
  }
}
`,
    controller: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { searchQuerySchema, upsertSearchDocumentSchema } from '../dtos/index.js';
import type { SearchService } from '../services/index.js';

export const createSearchController = (service: SearchService) => ({
  search: async (query: Record<string, string | undefined>) => {
    const input = validate(searchQuerySchema, query);
    return jsonResponse(200, await service.search(input.q));
  },
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSearchDocumentSchema, body)))
});
`,
    routes: `import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createSearchController } from '../controllers/index.js';
import { DynamoSearchRepository } from '../repositories/index.js';
import { SearchService } from '../services/index.js';

const config = loadConfig('search-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createSearchController(new SearchService(new DynamoSearchRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/search', authorize: true, handler: ({ query }) => controller.search(query) },
  { method: 'POST', path: '/api/v1/search/documents', authorize: true, roles: ['admin', 'catalog-manager'], handler: ({ body }) => controller.upsert(body) }
];
export const handler = createLambdaHandler({
  serviceName: 'search-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemorySearchRepository } from '../src/repositories/index.js';
import { SearchService } from '../src/services/index.js';

test('search service indexes and returns documents', async () => {
  const service = new SearchService(new InMemorySearchRepository());
  await service.upsert({
    documentType: 'product',
    title: 'Organic Banana',
    slug: 'organic-banana',
    searchTerm: 'banana',
    score: 100
  });
  const results = await service.search('banana');
  assert.equal(results.length, 1);
});
`
  },
  {
    folder: 'notification-service',
    packageName: '@freshmart/notification-service',
    className: 'NotificationService',
    entity: `export interface Notification {
  notificationId: string;
  recipientUserId: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
`,
    dto: `import { z } from 'zod';

export const createNotificationSchema = z.object({
  notificationId: z.string().uuid().optional(),
  recipientUserId: z.string().min(1).max(80),
  type: z.enum(['ORDER', 'PROMOTION', 'SYSTEM']),
  title: z.string().min(2).max(120),
  message: z.string().min(2).max(500)
});

export const markReadSchema = z.object({
  recipientUserId: z.string().min(1).max(80)
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
`,
    repository: `import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { Notification } from '../entities/index.js';

type NotificationRecord = TableEntity & Notification;

export interface NotificationRepository {
  listByUser(recipientUserId: string): Promise<Notification[]>;
  save(notification: Notification): Promise<Notification>;
  markRead(recipientUserId: string, notificationId: string): Promise<void>;
}

export class DynamoNotificationRepository implements NotificationRepository {
  private readonly repository: DynamoRepository<NotificationRecord>;
  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-notification-service') {
    this.repository = new DynamoRepository<NotificationRecord>(tableName);
  }
  async listByUser(recipientUserId: string): Promise<Notification[]> {
    return this.repository.query(\`USER#\${recipientUserId}\`, 'NOTIFICATION#');
  }
  async save(notification: Notification): Promise<Notification> {
    await this.repository.put({
      pk: \`USER#\${notification.recipientUserId}\`,
      sk: \`NOTIFICATION#\${notification.notificationId}\`,
      gsi1pk: 'ENTITY#NOTIFICATION',
      gsi1sk: \`\${notification.createdAt}#\${notification.notificationId}\`,
      ...notification
    });
    return notification;
  }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    await this.repository.update(
      { pk: \`USER#\${recipientUserId}\`, sk: \`NOTIFICATION#\${notificationId}\` },
      'SET isRead = :isRead, readAt = :readAt',
      { ':isRead': true, ':readAt': new Date().toISOString() }
    );
  }
}

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notifications = new Map<string, Notification>();
  async listByUser(recipientUserId: string): Promise<Notification[]> {
    return [...this.notifications.values()].filter((value) => value.recipientUserId === recipientUserId);
  }
  async save(notification: Notification): Promise<Notification> { this.notifications.set(notification.notificationId, notification); return notification; }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    const value = this.notifications.get(notificationId);
    if (value?.recipientUserId === recipientUserId) {
      this.notifications.set(notificationId, { ...value, isRead: true, readAt: new Date().toISOString() });
    }
  }
}
`,
    service: `import { randomUUID } from 'node:crypto';
import type { CreateNotificationDto } from '../dtos/index.js';
import type { Notification } from '../entities/index.js';
import type { NotificationRepository } from '../repositories/index.js';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}
  async listByUser(recipientUserId: string): Promise<Notification[]> { return this.repository.listByUser(recipientUserId); }
  async create(input: CreateNotificationDto): Promise<Notification> {
    return this.repository.save({
      notificationId: input.notificationId ?? randomUUID(),
      recipientUserId: input.recipientUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }
  async markRead(recipientUserId: string, notificationId: string): Promise<void> {
    await this.repository.markRead(recipientUserId, notificationId);
  }
}
`,
    controller: `import { jsonResponse, validate } from '@freshmart/platform-core';
import { createNotificationSchema, markReadSchema } from '../dtos/index.js';
import type { NotificationService } from '../services/index.js';

export const createNotificationController = (service: NotificationService) => ({
  list: async (recipientUserId: string) => jsonResponse(200, await service.listByUser(recipientUserId)),
  create: async (body: unknown) => jsonResponse(201, await service.create(validate(createNotificationSchema, body))),
  markRead: async (notificationId: string, body: unknown) => {
    const input = validate(markReadSchema, body);
    await service.markRead(input.recipientUserId, notificationId);
    return jsonResponse(204, null);
  }
});
`,
    routes: `import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createNotificationController } from '../controllers/index.js';
import { DynamoNotificationRepository } from '../repositories/index.js';
import { NotificationService } from '../services/index.js';

const config = loadConfig('notification-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createNotificationController(new NotificationService(new DynamoNotificationRepository(config.TABLE_NAME)));
export const routes: RouteDefinition[] = [
  { method: 'GET', path: '/api/v1/notifications/:recipientUserId', authorize: true, handler: ({ params }) => controller.list(params.recipientUserId) },
  { method: 'POST', path: '/api/v1/notifications', authorize: true, roles: ['admin', 'operations'], handler: ({ body }) => controller.create(body) },
  { method: 'POST', path: '/api/v1/notifications/:notificationId/read', authorize: true, handler: ({ params, body }) => controller.markRead(params.notificationId, body) }
];
export const handler = createLambdaHandler({
  serviceName: 'notification-service',
  routes,
  authorizer: { userPoolId: config.COGNITO_USER_POOL_ID, clientId: config.COGNITO_APP_CLIENT_ID, tokenUse: 'access' }
});
`,
    test: `import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryNotificationRepository } from '../src/repositories/index.js';
import { NotificationService } from '../src/services/index.js';

test('notification service creates notifications', async () => {
  const service = new NotificationService(new InMemoryNotificationRepository());
  await service.create({
    recipientUserId: 'user-1',
    type: 'SYSTEM',
    title: 'FreshMart',
    message: 'Welcome'
  });
  const notifications = await service.listByUser('user-1');
  assert.equal(notifications.length, 1);
});
`
  }
];

for (const service of services) {
  const serviceRoot = `services/${service.folder}`;
  write(`${serviceRoot}/package.json`, createPackageJson(service.packageName));
  write(`${serviceRoot}/tsconfig.json`, tsconfig);
  write(`${serviceRoot}/README.md`, `# ${service.folder}\n\nEnterprise TypeScript service for FreshMart.\n`);
  write(`${serviceRoot}/src/entities/index.ts`, service.entity);
  write(`${serviceRoot}/src/dtos/index.ts`, service.dto);
  write(`${serviceRoot}/src/repositories/index.ts`, service.repository);
  write(`${serviceRoot}/src/services/index.ts`, service.service);
  write(`${serviceRoot}/src/controllers/index.ts`, service.controller);
  write(`${serviceRoot}/src/routes/index.ts`, service.routes);
  write(`${serviceRoot}/src/validators/index.ts`, `export * from '../dtos/index.js';\n`);
  write(`${serviceRoot}/src/middlewares/index.ts`, `export const middlewareDescription = { validation: 'schema validation', authorization: 'JWT and role checks' };\n`);
  write(`${serviceRoot}/src/index.ts`, `export { handler } from './routes/index.js';\n`);
  write(`${serviceRoot}/openapi/openapi.json`, json({ openapi: '3.0.3', info: { title: service.folder, version: '1.0.0' } }));
  write(`${serviceRoot}/test/service.test.ts`, service.test);
}

console.log('Hardening services scaffolded.');
