import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { DeliveryController } from '../controllers/DeliveryController.js';
import { DynamoDeliveryRepository } from '../repositories/DynamoDeliveryRepository.js';
import { DeliveryService } from '../services/DeliveryService.js';

const config = loadConfig('delivery-service', {
  TABLE_NAME: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1)
});

const controller = new DeliveryController(new DeliveryService(new DynamoDeliveryRepository(config.TABLE_NAME)));

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/deliveries/:id',
    authorize: true,
    handler: ({ params }) => controller.getById(params.id as string)
  },
  {
    method: 'GET',
    path: '/api/v1/deliveries/order/:orderId',
    authorize: true,
    handler: ({ params }) => controller.getByOrder(params.orderId as string)
  },
  {
    method: 'POST',
    path: '/api/v1/deliveries/:id/assign',
    authorize: true,
    roles: ['admin'],
    handler: ({ params, body }) => controller.assignPartner(params.id as string, body)
  },
  {
    method: 'PATCH',
    path: '/api/v1/deliveries/:id/status',
    authorize: true,
    roles: ['admin', 'delivery_partner'],
    handler: ({ params, body }) => controller.updateStatus(params.id as string, body)
  }
];

export const apiHandler = createLambdaHandler({
  serviceName: 'delivery-service',
  routes: [...routes],
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
