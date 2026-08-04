import { jsonResponse, validate } from '@freshmart/platform-core';
import { addAddressSchema, upsertProfileSchema } from '../dtos/index.js';
import type { UserService } from '../services/index.js';

export const createUserController = (service: UserService) => ({
  upsertProfile: async (userId: string, body: unknown) => jsonResponse(200, await service.upsertProfile(userId, validate(upsertProfileSchema, body))),
  addAddress: async (userId: string, body: unknown) => jsonResponse(200, await service.addAddress(userId, validate(addAddressSchema, body))),
  getProfile: async (userId: string) => jsonResponse(200, await service.getProfile(userId))
});