import { ApiClient, type ApiSessionAccessor } from './http/create-api-client.js';
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
import { WarehouseClient } from './clients/warehouse-client.js';
import { DeliveryClient } from './clients/delivery-client.js';
import { IamClient } from './clients/iam-client.js';
import { ActivityClient } from './clients/activity-client.js';
import { AnalyticsClient } from './clients/analytics-client.js';

export const FRESHMART_DEFAULT_API_BASE_URL = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';

export interface SdkFactoryOptions {
  authBaseUrl?: string;
  customerBaseUrl?: string;
  adminBaseUrl?: string;
  commerceBaseUrl?: string;
  sessionAccessor?: ApiSessionAccessor;
}

export const createFreshMartSdk = ({
  authBaseUrl = FRESHMART_DEFAULT_API_BASE_URL,
  customerBaseUrl = authBaseUrl,
  adminBaseUrl = authBaseUrl,
  commerceBaseUrl = authBaseUrl,
  sessionAccessor
}: SdkFactoryOptions = {}) => {
  const authApi = new ApiClient(authBaseUrl, sessionAccessor);
  const customerApi = new ApiClient(customerBaseUrl, sessionAccessor);
  const adminApi = new ApiClient(adminBaseUrl, sessionAccessor);
  const commerceApi = new ApiClient(commerceBaseUrl, sessionAccessor);

  return {
    auth: new AuthClient(authApi),
    customerBff: new CustomerBffClient(customerApi),
    admin: new AdminClient(adminApi),
    catalog: new CatalogClient(commerceApi),
    category: new CategoryClient(commerceApi),
    cart: new CartClient(commerceApi),
    inventory: new InventoryClient(commerceApi),
    order: new OrderClient(commerceApi),
    wishlist: new WishlistClient(commerceApi),
    notifications: new NotificationClient(commerceApi),
    warehouse: new WarehouseClient(adminApi),
    delivery: new DeliveryClient(adminApi),
    iam: new IamClient(adminApi),
    activity: new ActivityClient(adminApi),
    analytics: new AnalyticsClient(adminApi)
  };
};
