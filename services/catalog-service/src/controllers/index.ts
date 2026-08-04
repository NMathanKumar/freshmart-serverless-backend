import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { CatalogService } from '../services/index.js';

export const createController = (service: CatalogService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (productId: string) => jsonResponse(200, await service.getById(productId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
