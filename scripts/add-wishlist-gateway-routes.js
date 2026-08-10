const { ApiGatewayV2Client, CreateRouteCommand, GetRoutesCommand } = require('@aws-sdk/client-apigatewayv2');

const apiId = '98fyk75ya9';
const targetIntegration = 'integrations/wjjv84h'; // Customer BFF Lambda
const client = new ApiGatewayV2Client({ region: 'ap-southeast-1' });

const routes = [
  'GET /v1/wishlist/{customerId}',
  'GET /api/v1/wishlist/{customerId}',
  'GET /v1/wishlist',
  'GET /api/v1/wishlist',
  'GET /customer/wishlist',
  'GET /api/v1/customer/wishlist',
  'POST /v1/wishlist/items',
  'POST /api/v1/wishlist/items',
  'POST /api/v1/customer/wishlist/items',
  'DELETE /v1/wishlist/items',
  'DELETE /api/v1/wishlist/items',
  'DELETE /api/v1/customer/wishlist/items',
  'ANY /v1/wishlist/{proxy+}',
  'ANY /wishlist/{proxy+}'
];

async function main() {
  const existingRoutesRes = await client.send(new GetRoutesCommand({ ApiId: apiId }));
  const existingKeys = new Set((existingRoutesRes.Items || []).map(r => r.RouteKey));

  for (const routeKey of routes) {
    if (existingKeys.has(routeKey)) {
      console.log(`Route already exists: ${routeKey}`);
      continue;
    }

    try {
      await client.send(new CreateRouteCommand({
        ApiId: apiId,
        RouteKey: routeKey,
        Target: targetIntegration
      }));
      console.log(`Successfully created route: ${routeKey}`);
    } catch (err) {
      console.error(`Failed creating route ${routeKey}:`, err.message);
    }
  }
}

main().catch(console.error);
