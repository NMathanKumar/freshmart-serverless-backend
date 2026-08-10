const { execSync } = require('child_process');

const apiId = '98fyk75ya9';
const target = 'integrations/c0poroq';

const routeIds = [
  '40l9aoi', // GET /v1/products
  'ihtnmwn', // GET /products
  '49maqxt', // POST /products/upload-url
  'kx5xham', // POST /v1/products/upload-url
  'ghdwxih', // POST /v1/products
  'haabkmo', // POST /products
  '4tjcctb', // ANY /products/{proxy+}
  'rrxwu4o', // ANY /v1/products/{proxy+}
  'u5z4rn5', // PUT /v1/products/{id}
  'givf8c9', // PUT /products/{id}
  'jc5liph', // DELETE /v1/products/{id}
  'thywf21'  // DELETE /products/{id}
];

for (const rId of routeIds) {
  try {
    console.log(`Updating route ${rId} to target ${target} & AuthorizationType NONE...`);
    execSync(`aws apigatewayv2 update-route --api-id ${apiId} --route-id ${rId} --target "${target}" --authorization-type NONE`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Route ${rId} update error:`, err.message);
  }
}

console.log('All product service routes unified to c0poroq!');
