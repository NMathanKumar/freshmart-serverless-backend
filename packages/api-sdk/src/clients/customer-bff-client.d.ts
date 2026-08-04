import type { CustomerCheckoutResponse, CustomerHomeResponse, CustomerProfileResponse, NotificationsResponse, WishlistResponse } from '../contracts/domain.js';
import { ApiClient } from '../http/create-api-client.js';
export declare class CustomerBffClient {
    private readonly client;
    constructor(client: ApiClient);
    getHome(): Promise<CustomerHomeResponse>;
    getCategories(): Promise<Record<string, unknown>>;
    getProductDetails(productId: string): Promise<Record<string, unknown>>;
    getCart(): Promise<Record<string, unknown>>;
    getCheckout(): Promise<CustomerCheckoutResponse>;
    getOrders(): Promise<Record<string, unknown>>;
    getProfile(): Promise<CustomerProfileResponse>;
    getWishlist(): Promise<WishlistResponse>;
    getNotifications(): Promise<NotificationsResponse>;
}
