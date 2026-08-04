import { jsonResponse, validate } from '@freshmart/platform-core';
import { loginSchema, logoutSchema, refreshTokenSchema, registerUserSchema } from '../dtos/index.js';
import type { AuthService } from '../services/index.js';

export const createAuthController = (service: AuthService) => ({
  register: async (body: unknown) => {
    const input = validate(registerUserSchema, body);
    const profile = await service.register({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber
    });
    return jsonResponse(201, profile);
  },
  login: async (body: unknown) => {
    const input = validate(loginSchema, body);
    const session = await service.login(input);
    return jsonResponse(200, session);
  },
  refresh: async (body: unknown) => {
    const input = validate(refreshTokenSchema, body);
    const session = await service.refresh(input.refreshToken);
    return jsonResponse(200, session);
  },
  logout: async (body: unknown) => {
    const input = validate(logoutSchema, body);
    await service.logout(input.accessToken);
    return jsonResponse(204, null);
  },
  me: async (userId: string) => jsonResponse(200, await service.getProfile(userId))
});
