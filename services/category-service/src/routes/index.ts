import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { CategoryService, createEventPublisher } from '../services/index.js';

const config = loadConfig('category-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = createController(new CategoryService(new DynamoStoreRepository(config.TABLE_NAME), createEventPublisher()));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/categories',
    authorize: true,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/api/v1/categories/:categoryId',
    authorize: true,
    handler: ({ params }) => controller.getById(params.categoryId)
  },
  {
    method: 'POST',
    path: '/api/v1/categories',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ body, event, auth }) => controller.upsert(body, event.headers?.['x-admin-user-id'] || auth?.subject)
  },
  {
    method: 'PUT',
    path: '/api/v1/categories/:categoryId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, body, event, auth }) => controller.update(params.categoryId, body, event.headers?.['x-admin-user-id'] || auth?.subject)
  },
  {
    method: 'DELETE',
    path: '/api/v1/categories/:categoryId',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ params, event, auth }) => controller.delete(params.categoryId, event.headers?.['x-admin-user-id'] || auth?.subject)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'category-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
