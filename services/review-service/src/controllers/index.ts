import { jsonResponse, validate } from '@freshmart/platform-core';
import { createReviewSchema, updateReviewSchema } from '../dtos/index.js';
import type { ReviewService } from '../services/index.js';

export const createController = (service: ReviewService) => ({
  listByProduct: async (productId: string) => jsonResponse(200, await service.listByProduct(productId)),
  listAdmin: async () => jsonResponse(200, await service.listAdmin()),
  getById: async (reviewId: string) => jsonResponse(200, await service.getById(reviewId)),
  create: async (body: unknown, customerId: string) => jsonResponse(201, await service.create(validate(createReviewSchema, body), customerId)),
  update: async (reviewId: string, body: unknown) => jsonResponse(200, await service.update(reviewId, validate(updateReviewSchema, body))),
  delete: async (reviewId: string, hardDelete: boolean) => jsonResponse(200, await service.delete(reviewId, hardDelete)),
  approve: async (reviewId: string, adminId: string) => jsonResponse(200, await service.approve(reviewId, adminId)),
  reject: async (reviewId: string, adminId: string) => jsonResponse(200, await service.reject(reviewId, adminId))
});
