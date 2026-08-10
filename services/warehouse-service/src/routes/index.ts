import { createLambdaHandler, loadConfig, type RouteDefinition } from '@freshmart/platform-core';
import { z } from 'zod';
import { warehouseController } from '../controllers/index.js';

const config = {
  DDB_TABLE_WAREHOUSES: process.env.DDB_TABLE_WAREHOUSES || 'freshmart-dev-warehouses',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || 'ap-southeast-1_RXGKIq89c',
  COGNITO_APP_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID || process.env.COGNITO_APP_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2',
};

export const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/api/v1/warehouses',
    authorize: false,
    handler: ({ query }) => warehouseController.listWarehouses(query?.limit)
  },
  {
    method: 'GET',
    path: '/api/v1/warehouses/:id',
    authorize: false,
    handler: ({ params }) => warehouseController.getWarehouseById(params.id)
  },
  {
    method: 'POST',
    path: '/api/v1/warehouses',
    authorize: true,
    roles: ['admin', 'operations'],
    handler: ({ body, event, auth }) => warehouseController.createWarehouse(body, event.headers?.['x-admin-user-id'] || auth?.subject || 'system')
  },
  {
    method: 'PUT',
    path: '/api/v1/warehouses/:id',
    authorize: true,
    roles: ['admin', 'operations'],
    handler: ({ params, body }) => warehouseController.updateWarehouse(params.id, body)
  },
  {
    method: 'DELETE',
    path: '/api/v1/warehouses/:id',
    authorize: true,
    roles: ['admin'],
    handler: ({ params, event, auth }) => warehouseController.softDeleteWarehouse(params.id, event.headers?.['x-admin-user-id'] || auth?.subject || 'system')
  },
  {
    method: 'PATCH',
    path: '/api/v1/warehouses/:id/status',
    authorize: true,
    roles: ['admin', 'operations'],
    handler: ({ params, body }) => warehouseController.updateWarehouseStatus(params.id, body)
  },

  {
    method: 'GET',
    path: '/api/v1/warehouses/:id/capacity',
    authorize: true,
    handler: ({ params }) => warehouseController.getCapacity(params.id)
  },
  // Picking Routes
  {
    method: 'POST',
    path: '/v1/warehouse/picking',
    authorize: true,
    roles: ['admin', 'operations', 'picker'],
    handler: async ({ body }) => {
      const { pickingController } = await import('../controllers/picking.controller.js');
      return pickingController.generatePickList(body);
    }
  },
  {
    method: 'POST',
    path: '/v1/warehouse/picking/:id/assign',
    authorize: true,
    roles: ['admin', 'operations'],
    handler: async ({ params, body }) => {
      const { pickingController } = await import('../controllers/picking.controller.js');
      return pickingController.assignPicker(params.id, body);
    }
  },
  {
    method: 'POST',
    path: '/v1/warehouse/picking/:id/confirm',
    authorize: true,
    roles: ['admin', 'operations', 'picker'],
    handler: async ({ params, body }) => {
      const { pickingController } = await import('../controllers/picking.controller.js');
      return pickingController.confirmPick(params.id, body);
    }
  },
  // Packing Routes
  {
    method: 'POST',
    path: '/v1/warehouse/packing',
    authorize: true,
    roles: ['admin', 'operations', 'packer'],
    handler: async ({ body }) => {
      const { packingController } = await import('../controllers/packing.controller.js');
      return packingController.createPackage(body);
    }
  },
  {
    method: 'POST',
    path: '/v1/warehouse/packing/:id/inspect',
    authorize: true,
    roles: ['admin', 'operations', 'inspector'],
    handler: async ({ params, body }) => {
      const { packingController } = await import('../controllers/packing.controller.js');
      return packingController.qualityInspection(params.id, body);
    }
  },
  // PO Routes
  {
    method: 'POST',
    path: '/api/v1/warehouse/po/:poId/receive',
    authorize: true,
    roles: ['admin', 'operations', 'receiver'],
    handler: async ({ params, body }) => {
      const { poController } = await import('../controllers/po.controller.js');
      return poController.receivePurchaseOrder(params.poId, body);
    }
  }
];

const expandedRoutes: RouteDefinition[] = [];
for (const r of routes) {
  const variations = new Set([
    r.path,
    `/warehouse-service${r.path}`,
    `/v1/warehouse-service${r.path}`,
    `/v1${r.path}`,
    r.path.replace('/api/v1', '/v1'),
    r.path.replace('/api/v1', ''),
    `/v1${r.path.replace('/api/v1', '')}`,
  ]);
  for (const p of variations) {
    if (p) {
      expandedRoutes.push({ ...r, path: p });
    }
  }
}

export const handler = createLambdaHandler({
  serviceName: 'warehouse-service',
  routes: expandedRoutes,
  authorizer: {
    userPoolId: config.COGNITO_USER_POOL_ID,
    clientId: config.COGNITO_APP_CLIENT_ID,
    tokenUse: 'access'
  }
});
