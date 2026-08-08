import { jsonResponse, validate } from '@freshmart/platform-core';
import { addAddressSchema, upsertProfileSchema } from '../dtos/index.js';
import type { UserService } from '../services/index.js';

export const createUserController = (service: UserService) => ({
  upsertProfile: async (userId: string, body: unknown) => jsonResponse(200, await service.upsertProfile(userId, validate(upsertProfileSchema, body))),
  addAddress: async (userId: string, body: unknown) => jsonResponse(200, await service.addAddress(userId, validate(addAddressSchema, body))),
  deleteAddress: async (userId: string, addressId: string) => jsonResponse(200, await service.deleteAddress(userId, addressId)),
  getProfile: async (userId: string, claims?: Record<string, unknown>) => jsonResponse(200, await service.getProfile(userId, claims))
});