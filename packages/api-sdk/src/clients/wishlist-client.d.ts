import type { WishlistResponse } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';
export declare class WishlistClient {
    private readonly client;
    constructor(client: ApiClient);
    getWishlist(customerId: string): Promise<WishlistResponse>;
    addItem(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
    removeItem(payload: Record<string, unknown>): Promise<void>;
}
