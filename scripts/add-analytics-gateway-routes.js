const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const integrationId = 'cw5571n';

const routes = [
  'GET /admin/analytics/dashboard',
  'GET /admin/analytics/export',
  'GET /admin/analytics/revenue',
  'GET /admin/analytics/orders',
  'GET /admin/analytics/products',
  'GET /admin/analytics/customers',
  'GET /admin/analytics/categories',
  'GET /admin/analytics/inventory',
  'GET /analytics/procurement',
];

routes.forEach((routeKey) => {
  try {
    const cmd = `aws apigatewayv2 create-route --api-id ${apiId} --route-key "${routeKey}" --target "integrations/${integrationId}"`;
    console.log(`Adding route: ${routeKey}...`);
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${routeKey} may already exist or failed: ${err.message}`);
  }
});

console.log('All API Gateway analytics routes created successfully!');
