import { jsonResponse, validate } from '@freshmart/platform-core';
import { searchQuerySchema, upsertSearchDocumentSchema } from '../dtos/index.js';
import type { SearchService } from '../services/index.js';

export const createSearchController = (service: SearchService) => ({
  search: async (query: Record<string, string | undefined>) => {
    const input = validate(searchQuerySchema, query);
    return jsonResponse(200, await service.search(input.q));
  },
  upsert: async (body: unknown) => jsonResponse(200, await service.upsert(validate(upsertSearchDocumentSchema, body)))
});
