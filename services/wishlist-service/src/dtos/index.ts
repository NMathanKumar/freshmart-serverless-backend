import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  wishlistItemId: z.string().uuid().optional(),
  customerId: z.string().min(1).max(80),
  productId: z.string().min(1).max(80),
  sku: z.string().min(1).max(80),
  productName: z.string().min(1).max(160)
});

export const customerPathSchema = z.object({
  customerId: z.string().min(1).max(80)
});

export const removeWishlistItemSchema = z.object({
  customerId: z.string().min(1).max(80),
  wishlistItemId: z.string().uuid()
});

export type AddWishlistItemDto = z.infer<typeof addWishlistItemSchema>;
export type RemoveWishlistItemDto = z.infer<typeof removeWishlistItemSchema>;
