const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const integrationTarget = 'integrations/lra3315';

const routes = [
  'ANY /v1/warehouse-service/{proxy+}',
  'ANY /warehouse-service/{proxy+}',
  'ANY /v1/warehouses',
  'ANY /v1/warehouses/{proxy+}',
  'ANY /v1/warehouse/{proxy+}',
  'ANY /api/v1/warehouses',
  'ANY /api/v1/warehouses/{proxy+}'
];

for (const r of routes) {
  try {
    console.log(`Creating route: ${r} -> ${integrationTarget}...`);
    execSync(`aws apigatewayv2 create-route --api-id ${apiId} --route-key "${r}" --target "${integrationTarget}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${r} already exists or failed:`, err.message);
  }
}

console.log('Done configuring warehouse routes in API Gateway!');
