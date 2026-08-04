import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { InventoryService } from '../services/index.js';

export const createController = (service: InventoryService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (sku: string) => jsonResponse(200, await service.getById(sku)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
