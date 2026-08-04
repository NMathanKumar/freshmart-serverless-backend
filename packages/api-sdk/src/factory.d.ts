import { type ApiSessionAccessor } from './http/create-api-client.js';
import { AdminClient } from './clients/admin-client.js';
import { AuthClient } from './clients/auth-client.js';
import { CartClient } from './clients/cart-client.js';
import { CatalogClient } from './clients/catalog-client.js';
import { CategoryClient } from './clients/category-client.js';
import { CustomerBffClient } from './clients/customer-bff-client.js';
import { InventoryClient } from './clients/inventory-client.js';
import { NotificationClient } from './clients/notification-client.js';
import { OrderClient } from './clients/order-client.js';
import { WishlistClient } from './clients/wishlist-client.js';
export interface SdkFactoryOptions {
    authBaseUrl: string;
    customerBaseUrl?: string;
    adminBaseUrl?: string;
    commerceBaseUrl?: string;
    sessionAccessor?: ApiSessionAccessor;
}
export declare const createFreshMartSdk: ({ authBaseUrl, customerBaseUrl, adminBaseUrl, commerceBaseUrl, sessionAccessor }: SdkFactoryOptions) => {
    auth: AuthClient;
    customerBff: CustomerBffClient;
    admin: AdminClient;
    catalog: CatalogClient;
    category: CategoryClient;
    cart: CartClient;
    inventory: InventoryClient;
    order: OrderClient;
    wishlist: WishlistClient;
    notifications: NotificationClient;
};
