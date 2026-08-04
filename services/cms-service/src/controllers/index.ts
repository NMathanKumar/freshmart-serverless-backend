import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { CmsService } from '../services/index.js';

export const createController = (service: CmsService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (pageId: string) => jsonResponse(200, await service.getById(pageId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
