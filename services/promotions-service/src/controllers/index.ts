import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertPromotionSchema } from '../dtos/index.js';
import type { PromotionsService } from '../services/index.js';

export const createPromotionsController = (service: PromotionsService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (promotionId: string) => jsonResponse(200, await service.getById(promotionId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertPromotionSchema, body)))
});
