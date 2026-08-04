import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createAdminBffController } from '../controllers/index.js';
import { InMemoryDashboardCacheRepository } from '../repositories/index.js';
import { AdminBffService, HttpAdminGateway } from '../services/index.js';

const config = loadConfig('admin-bff-service', {
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1),
  ADMIN_ANALYTICS_API_URL: z.string().url(),
  ADMIN_INVENTORY_API_URL: z.string().url(),
  ADMIN_ORDER_API_URL: z.string().url(),
  ADMIN_PRODUCT_API_URL: z.string().url(),
  ADMIN_USER_API_URL: z.string().url(),
  ADMIN_CMS_API_URL: z.string().url(),
  ADMIN_PROMOTIONS_API_URL: z.string().url(),
  ADMIN_COUPON_API_URL: z.string().url()
});

const controller = createAdminBffController(
  new AdminBffService(
    new HttpAdminGateway({
      analyticsBaseUrl: config.ADMIN_ANALYTICS_API_URL,
      inventoryBaseUrl: config.ADMIN_INVENTORY_API_URL,
      orderBaseUrl: config.ADMIN_ORDER_API_URL,
      productBaseUrl: config.ADMIN_PRODUCT_API_URL,
      userBaseUrl: config.ADMIN_USER_API_URL,
      cmsBaseUrl: config.ADMIN_CMS_API_URL,
      promotionsBaseUrl: config.ADMIN_PROMOTIONS_API_URL
    }),
    new InMemoryDashboardCacheRepository()
  )
);

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/admin/dashboard',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.dashboard(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/dashboard',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.dashboard(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/inventory',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.inventory(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/inventory',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.inventory(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/analytics',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.analytics(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/analytics',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.analytics(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/orders',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.orders(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/orders',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.orders(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/products',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'ops'],
    handler: ({ event }) => controller.products(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/products',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'ops'],
    handler: ({ event }) => controller.products(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/customers',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.customers(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/customers',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.customers(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/reports',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.reports(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/reports',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.reports(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/api/v1/admin/settings',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.settings(event.headers.authorization)
  },
  {
    method: 'GET',
    path: '/v1/admin/settings',
    authorize: true,
    roles: ['admin', 'ops'],
    handler: ({ event }) => controller.settings(event.headers.authorization)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'admin-bff-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
