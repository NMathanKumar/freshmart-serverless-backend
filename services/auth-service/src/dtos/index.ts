import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phoneNumber: z.string().min(8).max(20).optional()
});

export const loginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(12).max(128)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(16)
});

export const logoutSchema = z.object({
  accessToken: z.string().min(16)
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type LogoutDto = z.infer<typeof logoutSchema>;
