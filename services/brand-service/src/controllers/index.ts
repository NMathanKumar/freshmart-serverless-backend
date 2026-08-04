import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertBrandSchema } from '../dtos/index.js';
import type { BrandService } from '../services/index.js';

export const createBrandController = (service: BrandService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (brandId: string) => jsonResponse(200, await service.getById(brandId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertBrandSchema, body)))
});
