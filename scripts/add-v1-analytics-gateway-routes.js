const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const targetIntegration = 'integrations/cw5571n';

const routes = [
  'GET /v1/admin/analytics/dashboard',
  'GET /v1/admin/analytics/revenue',
  'GET /v1/admin/analytics/orders',
  'GET /v1/admin/analytics/customers',
  'GET /v1/admin/analytics/products',
  'GET /v1/admin/analytics/categories',
  'GET /v1/admin/analytics/inventory',
  'GET /v1/admin/analytics/export',
  'GET /v1/analytics/procurement',
];

for (const routeKey of routes) {
  try {
    console.log(`Creating route: ${routeKey}...`);
    const cmd = `aws apigatewayv2 create-route --api-id ${apiId} --route-key "${routeKey}" --target "${targetIntegration}"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${routeKey} might already exist or failed:`, err.message);
  }
}

console.log('Done registering /v1/admin/analytics routes!');
