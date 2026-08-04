import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { CmsService, createEventPublisher } from '../services/index.js';

const config = loadConfig('cms-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1),
  EVENT_BUS_NAME: z.string().min(1).optional()
});

const controller = createController(new CmsService(new DynamoStoreRepository(config.TABLE_NAME), createEventPublisher()));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/cms/pages',
    authorize: true,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/api/v1/cms/pages/:pageId',
    authorize: true,
    handler: ({ params }) => controller.getById(params.pageId)
  },
  {
    method: 'POST',
    path: '/api/v1/cms/pages',
    authorize: true,
    roles: ['admin', 'catalog-manager', 'operations'],
    handler: ({ body }) => controller.upsert(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'cms-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
