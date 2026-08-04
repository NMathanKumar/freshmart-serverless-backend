import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const write = (relativePath, value) => {
  const absolutePath = resolve(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const baseComponents = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  schemas: {
    ProblemDetails: {
      type: 'object',
      required: ['type', 'title', 'status', 'detail'],
      properties: {
        type: { type: 'string' },
        title: { type: 'string' },
        status: { type: 'integer' },
        detail: { type: 'string' },
        instance: { type: 'string' },
        requestId: { type: 'string' },
        errors: {}
      }
    }
  },
  responses: {
    Problem: {
      description: 'RFC7807 problem response',
      content: {
        'application/problem+json': {
          schema: { $ref: '#/components/schemas/ProblemDetails' }
        }
      }
    }
  }
};

const secured = [{ bearerAuth: [] }];

const services = [
  {
    file: 'services/auth-service/openapi/openapi.json',
    title: 'Authentication Service',
    paths: {
      '/api/v1/auth/register': { post: { tags: ['Auth'], summary: 'Register a new customer identity', responses: { '201': { description: 'Registered' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/auth/login': { post: { tags: ['Auth'], summary: 'Login with Cognito-backed credentials', responses: { '200': { description: 'Authenticated' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/auth/refresh-token': { post: { tags: ['Auth'], summary: 'Refresh a Cognito session', responses: { '200': { description: 'Refreshed' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/auth/logout': { post: { tags: ['Auth'], summary: 'Invalidate the current access token', security: secured, responses: { '204': { description: 'Logged out' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/auth/me': { get: { tags: ['Auth'], summary: 'Return the current application profile', security: secured, responses: { '200': { description: 'Current profile' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  {
    file: 'services/user-service/openapi/openapi.json',
    title: 'User Service',
    paths: {
      '/api/v1/users/profile': {
        get: { tags: ['Users'], summary: 'Get the current profile', security: secured, responses: { '200': { description: 'Profile' }, '4XX': { $ref: '#/components/responses/Problem' } } },
        put: { tags: ['Users'], summary: 'Create or update the current profile', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } }
      },
      '/api/v1/users/addresses': { post: { tags: ['Users'], summary: 'Add an address to the current profile', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  ...[
    ['catalog-service', 'Catalog Service', 'Catalog', '/api/v1/catalog/products', '/api/v1/catalog/products/{productId}'],
    ['inventory-service', 'Inventory Service', 'Inventory', '/api/v1/inventory/items', '/api/v1/inventory/items/{sku}'],
    ['cart-service', 'Cart Service', 'Cart', '/api/v1/cart', '/api/v1/cart/{customerId}'],
    ['order-service', 'Order Service', 'Orders', '/api/v1/orders', '/api/v1/orders/{orderId}'],
    ['category-service', 'Category Service', 'Categories', '/api/v1/categories', '/api/v1/categories/{categoryId}'],
    ['cms-service', 'CMS Service', 'CMS', '/api/v1/cms/pages', '/api/v1/cms/pages/{pageId}'],
    ['analytics-service', 'Analytics Service', 'Analytics', '/api/v1/analytics/snapshots', '/api/v1/analytics/snapshots/{snapshotId}'],
    ['promotions-service', 'Promotions Service', 'Promotions', '/api/v1/promotions', '/api/v1/promotions/{promotionId}'],
    ['brand-service', 'Brand Service', 'Brands', '/api/v1/brands', '/api/v1/brands/{brandId}']
  ].map(([folder, title, tag, listPath, itemPath]) => ({
    file: `services/${folder}/openapi/openapi.json`,
    title,
    paths: {
      [listPath]: {
        get: { tags: [tag], summary: `List ${tag.toLowerCase()}`, security: secured, responses: { '200': { description: 'Successful response' }, '4XX': { $ref: '#/components/responses/Problem' } } },
        post: { tags: [tag], summary: `Create or update ${tag.toLowerCase()}`, security: secured, responses: { '200': { description: 'Upserted' }, '4XX': { $ref: '#/components/responses/Problem' } } }
      },
      [itemPath]: {
        get: { tags: [tag], summary: `Get ${tag.toLowerCase()} by identifier`, security: secured, responses: { '200': { description: 'Successful response' }, '4XX': { $ref: '#/components/responses/Problem' } } }
      }
    }
  })),
  {
    file: 'services/wishlist-service/openapi/openapi.json',
    title: 'Wishlist Service',
    paths: {
      '/api/v1/wishlist/{customerId}': { get: { tags: ['Wishlist'], summary: 'List wishlist items for a customer', security: secured, responses: { '200': { description: 'Wishlist' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/wishlist/items': {
        post: { tags: ['Wishlist'], summary: 'Add a wishlist item', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } },
        delete: { tags: ['Wishlist'], summary: 'Remove a wishlist item', security: secured, responses: { '204': { description: 'Removed' }, '4XX': { $ref: '#/components/responses/Problem' } } }
      }
    }
  },
  {
    file: 'services/search-service/openapi/openapi.json',
    title: 'Search Service',
    paths: {
      '/api/v1/search': { get: { tags: ['Search'], summary: 'Search indexed documents', security: secured, parameters: [{ in: 'query', name: 'q', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Search results' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/search/documents': { post: { tags: ['Search'], summary: 'Index or update a search document', security: secured, responses: { '200': { description: 'Indexed' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  {
    file: 'services/notification-service/openapi/openapi.json',
    title: 'Notification Service',
    paths: {
      '/api/v1/notifications/{recipientUserId}': { get: { tags: ['Notifications'], summary: 'List notifications for a user', security: secured, responses: { '200': { description: 'Notifications' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/notifications': { post: { tags: ['Notifications'], summary: 'Create a notification', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/notifications/{notificationId}/read': { post: { tags: ['Notifications'], summary: 'Mark a notification as read', security: secured, responses: { '204': { description: 'Read' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  {
    file: 'services/customer-bff-service/openapi/openapi.json',
    title: 'Customer Backend For Frontend',
    paths: {
      '/api/v1/customer/home': { get: { tags: ['Customer BFF'], summary: 'Customer home aggregation', security: secured, responses: { '200': { description: 'Home' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/categories': { get: { tags: ['Customer BFF'], summary: 'Category aggregation', security: secured, responses: { '200': { description: 'Categories' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/products/{productId}': { get: { tags: ['Customer BFF'], summary: 'Product details aggregation', security: secured, responses: { '200': { description: 'Product details' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/cart': { get: { tags: ['Customer BFF'], summary: 'Cart aggregation', security: secured, responses: { '200': { description: 'Cart' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/checkout': { get: { tags: ['Customer BFF'], summary: 'Checkout aggregation', security: secured, responses: { '200': { description: 'Checkout' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/orders': { get: { tags: ['Customer BFF'], summary: 'Orders aggregation', security: secured, responses: { '200': { description: 'Orders' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/profile': { get: { tags: ['Customer BFF'], summary: 'Profile aggregation', security: secured, responses: { '200': { description: 'Profile' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/wishlist': { get: { tags: ['Customer BFF'], summary: 'Wishlist aggregation', security: secured, responses: { '200': { description: 'Wishlist' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/customer/notifications': { get: { tags: ['Customer BFF'], summary: 'Notifications aggregation', security: secured, responses: { '200': { description: 'Notifications' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  {
    file: 'services/admin-bff-service/openapi/openapi.json',
    title: 'Admin Backend For Frontend',
    paths: {
      '/api/v1/admin/dashboard': { get: { tags: ['Admin BFF'], summary: 'Admin dashboard aggregation', security: secured, responses: { '200': { description: 'Dashboard' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/inventory': { get: { tags: ['Admin BFF'], summary: 'Inventory aggregation', security: secured, responses: { '200': { description: 'Inventory' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/analytics': { get: { tags: ['Admin BFF'], summary: 'Analytics aggregation', security: secured, responses: { '200': { description: 'Analytics' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/orders': { get: { tags: ['Admin BFF'], summary: 'Orders aggregation', security: secured, responses: { '200': { description: 'Orders' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/products': { get: { tags: ['Admin BFF'], summary: 'Products aggregation', security: secured, responses: { '200': { description: 'Products' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/customers': { get: { tags: ['Admin BFF'], summary: 'Customers aggregation', security: secured, responses: { '200': { description: 'Customers' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/reports': { get: { tags: ['Admin BFF'], summary: 'Reports aggregation', security: secured, responses: { '200': { description: 'Reports' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/api/v1/admin/settings': { get: { tags: ['Admin BFF'], summary: 'Settings aggregation', security: secured, responses: { '200': { description: 'Settings' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  },
  {
    file: 'services/admin-service/openapi/openapi.json',
    title: 'Admin Service',
    paths: {
      '/v1/admin/categories': { get: { tags: ['Admin Categories'], summary: 'List categories', security: secured, responses: { '200': { description: 'Categories' }, '4XX': { $ref: '#/components/responses/Problem' } } }, post: { tags: ['Admin Categories'], summary: 'Create category', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/categories/{categoryId}': { get: { tags: ['Admin Categories'], summary: 'Get category', security: secured, responses: { '200': { description: 'Category' }, '4XX': { $ref: '#/components/responses/Problem' } } }, put: { tags: ['Admin Categories'], summary: 'Update category', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } }, delete: { tags: ['Admin Categories'], summary: 'Delete category', security: secured, responses: { '200': { description: 'Deleted' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/reviews': { get: { tags: ['Admin Reviews'], summary: 'List reviews', security: secured, responses: { '200': { description: 'Reviews' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/reviews/{reviewId}': { get: { tags: ['Admin Reviews'], summary: 'Get review', security: secured, responses: { '200': { description: 'Review' }, '4XX': { $ref: '#/components/responses/Problem' } } }, patch: { tags: ['Admin Reviews'], summary: 'Moderate review', security: secured, responses: { '200': { description: 'Moderated' }, '4XX': { $ref: '#/components/responses/Problem' } } }, delete: { tags: ['Admin Reviews'], summary: 'Delete review', security: secured, responses: { '200': { description: 'Deleted' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/coupons': { get: { tags: ['Admin Coupons'], summary: 'List coupons', security: secured, responses: { '200': { description: 'Coupons' }, '4XX': { $ref: '#/components/responses/Problem' } } }, post: { tags: ['Admin Coupons'], summary: 'Create coupon', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/coupons/{couponId}': { get: { tags: ['Admin Coupons'], summary: 'Get coupon', security: secured, responses: { '200': { description: 'Coupon' }, '4XX': { $ref: '#/components/responses/Problem' } } }, put: { tags: ['Admin Coupons'], summary: 'Update coupon', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } }, delete: { tags: ['Admin Coupons'], summary: 'Delete coupon', security: secured, responses: { '200': { description: 'Deleted' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/coupons/{couponId}/status': { patch: { tags: ['Admin Coupons'], summary: 'Update coupon status', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/suppliers': { get: { tags: ['Admin Suppliers'], summary: 'List suppliers', security: secured, responses: { '200': { description: 'Suppliers' }, '4XX': { $ref: '#/components/responses/Problem' } } }, post: { tags: ['Admin Suppliers'], summary: 'Create supplier', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/suppliers/{supplierId}': { get: { tags: ['Admin Suppliers'], summary: 'Get supplier', security: secured, responses: { '200': { description: 'Supplier' }, '4XX': { $ref: '#/components/responses/Problem' } } }, put: { tags: ['Admin Suppliers'], summary: 'Update supplier', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } }, delete: { tags: ['Admin Suppliers'], summary: 'Delete supplier', security: secured, responses: { '200': { description: 'Deleted' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/purchase-orders': { get: { tags: ['Admin Purchase Orders'], summary: 'List POs', security: secured, responses: { '200': { description: 'POs' }, '4XX': { $ref: '#/components/responses/Problem' } } }, post: { tags: ['Admin Purchase Orders'], summary: 'Create PO', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/purchase-orders/{purchaseOrderId}': { get: { tags: ['Admin Purchase Orders'], summary: 'Get PO', security: secured, responses: { '200': { description: 'PO' }, '4XX': { $ref: '#/components/responses/Problem' } } }, put: { tags: ['Admin Purchase Orders'], summary: 'Update PO', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/purchase-orders/{purchaseOrderId}/receive': { post: { tags: ['Admin Purchase Orders'], summary: 'Receive PO', security: secured, responses: { '200': { description: 'Received' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/purchase-orders/{purchaseOrderId}/cancel': { post: { tags: ['Admin Purchase Orders'], summary: 'Cancel PO', security: secured, responses: { '200': { description: 'Cancelled' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/deliveries': { get: { tags: ['Admin Deliveries'], summary: 'List deliveries', security: secured, responses: { '200': { description: 'Deliveries' }, '4XX': { $ref: '#/components/responses/Problem' } } }, post: { tags: ['Admin Deliveries'], summary: 'Create delivery', security: secured, responses: { '201': { description: 'Created' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/deliveries/{deliveryId}': { get: { tags: ['Admin Deliveries'], summary: 'Get delivery', security: secured, responses: { '200': { description: 'Delivery' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/deliveries/{deliveryId}/status': { patch: { tags: ['Admin Deliveries'], summary: 'Update delivery status', security: secured, responses: { '200': { description: 'Updated' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/deliveries/{deliveryId}/assign': { post: { tags: ['Admin Deliveries'], summary: 'Assign driver', security: secured, responses: { '200': { description: 'Assigned' }, '4XX': { $ref: '#/components/responses/Problem' } } } },
      '/v1/admin/deliveries/{deliveryId}/cancel': { post: { tags: ['Admin Deliveries'], summary: 'Cancel delivery', security: secured, responses: { '200': { description: 'Cancelled' }, '4XX': { $ref: '#/components/responses/Problem' } } } }
    }
  }
];

const userService = services.find((service) => service.file === 'services/user-service/openapi/openapi.json');
if (userService) {
  const customerIdParameter = {
    in: 'path', name: 'customerId', required: true, schema: { type: 'string', minLength: 1, maxLength: 100 }
  };
  const adminResponses = {
    '401': { $ref: '#/components/responses/Problem' },
    '403': { $ref: '#/components/responses/Problem' },
    '404': { $ref: '#/components/responses/Problem' },
    '422': { $ref: '#/components/responses/Problem' },
    '500': { $ref: '#/components/responses/Problem' }
  };
  userService.paths['/v1/admin/customers'] = {
    get: {
      tags: ['Admin Customers'], summary: 'List and filter customers for administrators', security: secured,
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
        { in: 'query', name: 'pageSize', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Alias for pageSize (legacy)' },
        { in: 'query', name: 'search', schema: { type: 'string', maxLength: 120 } },
        { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/AdminCustomerStatus' } },
        { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['registrationDate', 'updatedAt', 'name', 'email', 'orderCount', 'totalSpending', 'lastOrderDate'], default: 'registrationDate' } },
        { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
      ],
      responses: {
        '200': { description: 'Paginated customers', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCustomerListEnvelope' } } } },
        ...adminResponses
      }
    }
  };
  userService.paths['/v1/admin/customers/{customerId}'] = {
    get: {
      tags: ['Admin Customers'], summary: 'Get an administrator customer view', security: secured,
      parameters: [customerIdParameter],
      responses: {
        '200': { description: 'Customer details', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCustomerEnvelope' } } } },
        ...adminResponses
      }
    }
  };
  userService.paths['/v1/admin/customers/{customerId}/status'] = {
    patch: {
      tags: ['Admin Customers'], summary: 'Update customer account status when supported by the profile domain', security: secured,
      parameters: [customerIdParameter],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { $ref: '#/components/schemas/AdminCustomerStatus' } } } } }
      },
      responses: {
        '200': { description: 'Updated customer', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminCustomerEnvelope' } } } },
        '409': { $ref: '#/components/responses/Problem' },
        ...adminResponses
      }
    }
  };
  userService.components = {
    ...baseComponents,
    schemas: {
      ...baseComponents.schemas,
      AdminCustomerStatus: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] },
      AdminCustomer: {
        type: 'object',
        required: ['customerId', 'name', 'email', 'phone', 'avatarUrl', 'registrationDate', 'updatedAt', 'status', 'defaultAddress', 'addresses', 'orderCount', 'totalSpending', 'lastOrderDate'],
        properties: {
          customerId: { type: 'string' }, name: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true }, phone: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          registrationDate: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
          status: { allOf: [{ $ref: '#/components/schemas/AdminCustomerStatus' }], nullable: true },
          defaultAddress: { nullable: true }, addresses: { type: 'array', items: {} },
          orderCount: { type: 'integer', minimum: 0 }, totalSpending: { type: 'number', minimum: 0 },
          lastOrderDate: { type: 'string', format: 'date-time', nullable: true },
          statistics: { $ref: '#/components/schemas/AdminCustomerStatistics' },
          orderSummary: { $ref: '#/components/schemas/AdminCustomerOrderSummary' },
          recentOrders: { type: 'array', items: { $ref: '#/components/schemas/AdminCustomerRecentOrder' } }
        }
      },
      AdminCustomerStatistics: {
        type: 'object', required: ['orderCount', 'totalSpending', 'lastOrderDate', 'paidOrderCount'],
        properties: {
          orderCount: { type: 'integer' }, totalSpending: { type: 'number' },
          lastOrderDate: { type: 'string', format: 'date-time', nullable: true },
          paidOrderCount: { type: 'integer' }
        }
      },
      AdminCustomerOrderSummary: {
        type: 'object', required: ['total', 'paid', 'pending', 'cancelled'],
        properties: {
          total: { type: 'integer' }, paid: { type: 'integer' },
          pending: { type: 'integer' }, cancelled: { type: 'integer' }
        }
      },
      AdminCustomerRecentOrder: {
        type: 'object', required: ['orderId', 'orderStatus', 'paymentStatus', 'totalAmount', 'createdAt'],
        properties: {
          orderId: { type: 'string' }, orderStatus: { type: 'string', nullable: true },
          paymentStatus: { type: 'string', nullable: true }, totalAmount: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      AdminCustomerSummary: {
        type: 'object', required: ['totalCustomers', 'activeCustomers', 'inactiveCustomers', 'newCustomers'],
        properties: {
          totalCustomers: { type: 'integer' }, activeCustomers: { type: 'integer' },
          inactiveCustomers: { type: 'integer' }, newCustomers: { type: 'integer' }
        }
      },
      AdminCustomerEnvelope: {
        type: 'object', required: ['success', 'message', 'data', 'timestamp'],
        properties: {
          success: { type: 'boolean' }, message: { type: 'string' },
          data: { $ref: '#/components/schemas/AdminCustomer' }, timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', nullable: true }
        }
      },
      AdminCustomerListEnvelope: {
        type: 'object', required: ['success', 'message', 'data', 'meta', 'timestamp'],
        properties: {
          success: { type: 'boolean' }, message: { type: 'string' },
          data: { type: 'array', items: { $ref: '#/components/schemas/AdminCustomer' } },
          meta: { type: 'object', required: ['page', 'pageSize', 'total', 'totalPages', 'summary'], properties: { page: { type: 'integer' }, pageSize: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' }, summary: { $ref: '#/components/schemas/AdminCustomerSummary' } } },
          timestamp: { type: 'string', format: 'date-time' }, requestId: { type: 'string', nullable: true }
        }
      }
    }
  };
}

const orderService = services.find((service) => service.file === 'services/order-service/openapi/openapi.json');
if (orderService) {
  const orderIdParameter = {
    in: 'path', name: 'orderId', required: true, schema: { type: 'string', minLength: 1, maxLength: 100 }
  };
  const adminResponses = {
    '401': { $ref: '#/components/responses/Problem' },
    '403': { $ref: '#/components/responses/Problem' },
    '404': { $ref: '#/components/responses/Problem' },
    '422': { $ref: '#/components/responses/Problem' },
    '500': { $ref: '#/components/responses/Problem' }
  };
  orderService.paths['/api/v1/admin/orders'] = {
    get: {
      tags: ['Admin Orders'],
      summary: 'List and filter orders for administrators',
      security: secured,
      parameters: [
        { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
        { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        { in: 'query', name: 'search', schema: { type: 'string', maxLength: 120 } },
        { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/OrderStatus' } },
        { in: 'query', name: 'paymentStatus', schema: { $ref: '#/components/schemas/PaymentStatus' } },
        { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
        { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
        { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'totalAmount', 'orderId'], default: 'createdAt' } },
        { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
      ],
      responses: {
        '200': { description: 'Paginated orders', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminOrderListEnvelope' } } } },
        ...adminResponses
      }
    }
  };
  orderService.paths['/api/v1/admin/orders/{orderId}'] = {
    get: {
      tags: ['Admin Orders'], summary: 'Get an administrator order view', security: secured,
      parameters: [orderIdParameter],
      responses: {
        '200': { description: 'Order details', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminOrderEnvelope' } } } },
        ...adminResponses
      }
    }
  };
  orderService.paths['/api/v1/admin/orders/{orderId}/status'] = {
    patch: {
      tags: ['Admin Orders'], summary: 'Apply a supported order status transition', security: secured,
      parameters: [orderIdParameter],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', required: ['orderStatus'], properties: { orderStatus: { $ref: '#/components/schemas/OrderStatus' } } } } }
      },
      responses: {
        '200': { description: 'Updated order', content: { 'application/json': { schema: { $ref: '#/components/schemas/AdminOrderEnvelope' } } } },
        '409': { $ref: '#/components/responses/Problem' },
        ...adminResponses
      }
    }
  };
  orderService.components = {
    ...baseComponents,
    schemas: {
      ...baseComponents.schemas,
      OrderStatus: { type: 'string', enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] },
      PaymentStatus: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
      AdminOrderCustomer: {
        type: 'object', required: ['customerId', 'name', 'email', 'phone', 'avatarUrl', 'addresses'],
        properties: {
          customerId: { type: 'string' }, name: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true }, phone: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true }, addresses: { type: 'array', items: {} }
        }
      },
      AdminOrderItem: {
        type: 'object', required: ['productId', 'quantity', 'price'],
        properties: {
          productId: { type: 'string' }, productName: { type: 'string', nullable: true },
          quantity: { type: 'number' }, price: { type: 'number' }, imageUrl: { type: 'string', nullable: true },
          lineTotal: { type: 'number' }
        }
      },
      AdminOrder: {
        type: 'object',
        required: ['orderId', 'customer', 'items', 'itemsCount', 'itemImages', 'subtotal', 'tax', 'discount', 'totalAmount', 'paymentStatus', 'paymentMethod', 'orderStatus', 'deliveryStatus', 'pickupTime', 'shippingAddress', 'statusHistory', 'createdAt', 'updatedAt', 'version'],
        properties: {
          orderId: { type: 'string' }, customer: { $ref: '#/components/schemas/AdminOrderCustomer' },
          items: { type: 'array', items: { $ref: '#/components/schemas/AdminOrderItem' } },
          itemsCount: { type: 'number' }, itemImages: { type: 'array', items: { type: 'string' } },
          subtotal: { type: 'number' }, tax: { type: 'number' }, discount: { type: 'number' }, totalAmount: { type: 'number' },
          paymentStatus: { allOf: [{ $ref: '#/components/schemas/PaymentStatus' }], nullable: true },
          paymentMethod: { nullable: true }, orderStatus: { $ref: '#/components/schemas/OrderStatus' },
          deliveryStatus: { nullable: true }, pickupTime: { type: 'string', nullable: true },
          shippingAddress: { nullable: true }, statusHistory: { nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          updatedAt: { type: 'string', format: 'date-time', nullable: true }, version: { type: 'integer' }
        }
      },
      AdminOrderEnvelope: {
        type: 'object', required: ['success', 'message', 'data', 'timestamp'],
        properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/AdminOrder' }, timestamp: { type: 'string', format: 'date-time' }, requestId: { type: 'string', nullable: true } }
      },
      AdminOrderListEnvelope: {
        type: 'object', required: ['success', 'message', 'data', 'meta', 'timestamp'],
        properties: {
          success: { type: 'boolean' }, message: { type: 'string' },
          data: { type: 'array', items: { $ref: '#/components/schemas/AdminOrder' } },
          meta: { type: 'object' }, timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', nullable: true }
        }
      }
    }
  };
}

for (const service of services) {
  write(service.file, {
    openapi: '3.0.3',
    info: {
      title: service.title,
      version: '1.0.0',
      description: `${service.title} API for FreshMart.`
    },
    servers: [{ url: 'https://api.freshmart.example' }],
    paths: service.paths,
    components: service.components || baseComponents
  });
}

console.log('OpenAPI contracts built.');
