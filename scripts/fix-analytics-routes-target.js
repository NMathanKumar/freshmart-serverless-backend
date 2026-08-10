const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const analyticsIntegration = 'integrations/h1gp3vq';

// 1. Get all existing routes
const routesOutput = execSync(`aws apigatewayv2 get-routes --api-id ${apiId}`, { encoding: 'utf8' });
const routes = JSON.parse(routesOutput).Items || [];

const analyticsRoutes = routes.filter(r => r.RouteKey.includes('analytics'));

console.log(`Found ${analyticsRoutes.length} analytics routes to update:`);

for (const r of analyticsRoutes) {
  console.log(`Updating route ${r.RouteKey} (${r.RouteId}) -> ${analyticsIntegration}...`);
  try {
    execSync(`aws apigatewayv2 update-route --api-id ${apiId} --route-id ${r.RouteId} --target "${analyticsIntegration}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to update route ${r.RouteKey}:`, err.message);
  }
}

// 2. Also ensure ANY /v1/admin/analytics/{proxy+} exists
const additionalRoutes = [
  'ANY /v1/admin/analytics/{proxy+}',
  'ANY /admin/analytics/{proxy+}',
  'ANY /v1/analytics/{proxy+}',
  'ANY /analytics/{proxy+}'
];

for (const routeKey of additionalRoutes) {
  try {
    console.log(`Creating helper route: ${routeKey}...`);
    execSync(`aws apigatewayv2 create-route --api-id ${apiId} --route-key "${routeKey}" --target "${analyticsIntegration}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${routeKey} already exists or failed.`);
  }
}

console.log('Done updating all analytics routes to target freshmart-dev-analytics-service (h1gp3vq)!');
