import { z } from 'zod';

export const addressSchema = z.object({
  addressId: z.string().uuid().optional(),
  label: z.string().min(1).max(40),
  line1: z.string().min(1).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  postalCode: z.string().min(4).max(12),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const upsertProfileSchema = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const addAddressSchema = addressSchema;

export type UpsertProfileDto = z.infer<typeof upsertProfileSchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;