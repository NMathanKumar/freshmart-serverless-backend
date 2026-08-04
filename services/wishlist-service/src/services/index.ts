import { randomUUID } from 'node:crypto';
import type { WishlistItem } from '../entities/index.js';
import type { WishlistRepository } from '../repositories/index.js';

export class WishlistService {
  constructor(private readonly repository: WishlistRepository) {}

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return this.repository.listByCustomer(customerId);
  }

  async add(input: Omit<WishlistItem, 'wishlistItemId' | 'addedAt'> & Partial<Pick<WishlistItem, 'wishlistItemId'>>): Promise<WishlistItem> {
    const item: WishlistItem = {
      wishlistItemId: input.wishlistItemId ?? randomUUID(),
      addedAt: new Date().toISOString(),
      ...input
    };
    return this.repository.save(item);
  }

  async remove(customerId: string, wishlistItemId: string): Promise<void> {
    await this.repository.delete(customerId, wishlistItemId);
  }
}
