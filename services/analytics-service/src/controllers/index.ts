import { jsonResponse, validate } from '@freshmart/platform-core';
import { upsertSchema } from '../dtos/index.js';
import type { AnalyticsService } from '../services/index.js';

export const createController = (service: AnalyticsService) => ({
  list: async () => jsonResponse(200, await service.list()),
  getById: async (snapshotId: string) => jsonResponse(200, await service.getById(snapshotId)),
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSchema, body)))
});
