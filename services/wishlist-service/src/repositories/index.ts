import { DynamoRepository, type TableEntity } from '@freshmart/platform-core';
import type { WishlistItem } from '../entities/index.js';

type WishlistRecord = TableEntity & WishlistItem;

export interface WishlistRepository {
  listByCustomer(customerId: string): Promise<WishlistItem[]>;
  save(item: WishlistItem): Promise<WishlistItem>;
  delete(customerId: string, wishlistItemId: string): Promise<void>;
}

export class DynamoWishlistRepository implements WishlistRepository {
  private readonly repository: DynamoRepository<WishlistRecord>;

  constructor(tableName = process.env.TABLE_NAME ?? 'freshmart-wishlist-service') {
    this.repository = new DynamoRepository<WishlistRecord>(tableName);
  }

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return this.repository.query(`CUSTOMER#${customerId}`, 'ITEM#');
  }

  async save(item: WishlistItem): Promise<WishlistItem> {
    await this.repository.put({
      pk: `CUSTOMER#${item.customerId}`,
      sk: `ITEM#${item.wishlistItemId}`,
      gsi1pk: 'ENTITY#WISHLIST_ITEM',
      gsi1sk: `${item.addedAt}#${item.wishlistItemId}`,
      ...item
    });
    return item;
  }

  async delete(): Promise<void> {}
}

export class InMemoryWishlistRepository implements WishlistRepository {
  private readonly items = new Map<string, WishlistItem>();

  async listByCustomer(customerId: string): Promise<WishlistItem[]> {
    return [...this.items.values()].filter((item) => item.customerId === customerId);
  }

  async save(item: WishlistItem): Promise<WishlistItem> {
    this.items.set(item.wishlistItemId, item);
    return item;
  }

  async delete(customerId: string, wishlistItemId: string): Promise<void> {
    const item = this.items.get(wishlistItemId);
    if (item?.customerId === customerId) {
      this.items.delete(wishlistItemId);
    }
  }
}
