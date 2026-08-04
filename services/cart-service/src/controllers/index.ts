import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { CartService } from '../services/index.js';

export const createController = (service: CartService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (customerId: string) => jsonResponse(200, await service.getById(customerId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
