import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { createController } from '../controllers/index.js';
import { DynamoStoreRepository } from '../repositories/index.js';
import { InventoryService, createEventPublisher } from '../services/index.js';

const tableName = process.env.TABLE_NAME || process.env.DDB_TABLE_INVENTORY || 'freshmart-dev-inventory';
const userPoolId = process.env.COGNITO_USER_POOL_ID || 'ap-southeast-1_RXGKIq89c';
const clientId = process.env.COGNITO_APP_CLIENT_ID || process.env.COGNITO_USER_POOL_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2';

const controller = createController(
  new InventoryService(new DynamoStoreRepository(tableName), createEventPublisher())
);

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/inventory',
    authorize: false,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/v1/inventory',
    authorize: false,
    handler: () => controller.list()
  },
  {
    method: 'GET',
    path: '/inventory/:sku',
    authorize: false,
    handler: ({ params }) => controller.getById(params.sku)
  },
  {
    method: 'POST',
    path: '/inventory',
    authorize: false,
    handler: ({ body }) => controller.upsert(body)
  }
];

export const handler = createLambdaHandler({
  serviceName: 'inventory-service',
  routes: [...routes],
  authorizer: {
    userPoolId,
    clientId,
    tokenUse: 'access'
  }
});
