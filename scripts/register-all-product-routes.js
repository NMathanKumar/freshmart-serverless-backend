const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const target = 'integrations/tkznq0l';

const routes = [
  'ANY /products/{proxy+}',
  'ANY /v1/products/{proxy+}',
  'POST /v1/products',
  'POST /products',
  'POST /v1/products/upload-url',
  'POST /products/upload-url',
  'PUT /v1/products/{id}',
  'PUT /products/{id}',
  'DELETE /v1/products/{id}',
  'DELETE /products/{id}'
];

for (const routeKey of routes) {
  try {
    console.log(`Creating/Updating route: ${routeKey}...`);
    execSync(`aws apigatewayv2 create-route --api-id ${apiId} --route-key "${routeKey}" --target "${target}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${routeKey} already exists or error:`, err.message);
  }
}

console.log('All product service API Gateway routes registered!');
