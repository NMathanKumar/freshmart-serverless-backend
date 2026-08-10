const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const productServiceTarget = 'integrations/c0poroq';
const customerBffTarget = 'integrations/gvnih89';
const inventoryServiceTarget = 'integrations/n9ugs4r';

const routes = [
  { key: 'GET /v1/warehouses', target: inventoryServiceTarget },
  { key: 'GET /warehouses', target: inventoryServiceTarget },
  { key: 'GET /v1/products', target: productServiceTarget },
  { key: 'GET /products', target: productServiceTarget },
  { key: 'GET /v1/categories', target: customerBffTarget },
  { key: 'GET /categories', target: customerBffTarget },
];

for (const r of routes) {
  try {
    console.log(`Creating route: ${r.key}...`);
    const cmd = `aws apigatewayv2 create-route --api-id ${apiId} --route-key "${r.key}" --target "${r.target}"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${r.key} already exists or failed:`, err.message);
  }
}

console.log('Done registering inventory helper routes!');
