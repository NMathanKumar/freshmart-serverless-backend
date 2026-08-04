import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { OrderService } from '../services/index.js';

export const createController = (service: OrderService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (orderId: string) => jsonResponse(200, await service.getById(orderId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
