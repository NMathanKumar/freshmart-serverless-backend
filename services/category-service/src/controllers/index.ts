import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { CategoryService } from '../services/index.js';

export const createController = (service: CategoryService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (categoryId: string) => jsonResponse(200, await service.getById(categoryId)),
  upsert: async (body: unknown, userId?: string) => jsonResponse(200, await service.upsert(validate(upsertSchema, body), userId)),
  update: async (categoryId: string, body: unknown, userId?: string) => jsonResponse(200, await service.update(categoryId, validate(upsertSchema, body), userId)),
  delete: async (categoryId: string, _userId?: string) => jsonResponse(200, await service.delete(categoryId))
});
