const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const bffTarget = 'integrations/gvnih89';

const routes = [
  'ANY /v1/categories',
  'ANY /v1/categories/{proxy+}',
  'ANY /categories',
  'ANY /categories/{proxy+}',
  'ANY /api/v1/categories',
  'ANY /api/v1/categories/{proxy+}',
  'ANY /v1/api/v1/categories',
  'ANY /v1/api/v1/categories/{proxy+}',
  'ANY /customer/categories',
  'ANY /customer/categories/{proxy+}',
  'ANY /v1/customer/categories',
  'ANY /v1/customer/categories/{proxy+}'
];

for (const r of routes) {
  try {
    console.log(`Configuring route: ${r} -> ${bffTarget}...`);
    execSync(`aws apigatewayv2 create-route --api-id ${apiId} --route-key "${r}" --target "${bffTarget}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${r} already exists or failed:`, err.message);
  }
}

console.log('Done configuring category routes in API Gateway!');
