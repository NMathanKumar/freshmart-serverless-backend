const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');

// 1. Root scripts
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const required = ['build', 'typecheck', 'test', 'package', 'verify:deployment'];
required.forEach((s) => {
  if (!pkg.scripts?.[s]) throw new Error('Missing script: ' + s);
});
console.log('✅ Root scripts OK');

// 2. Service workspace shape + zip sizes (no extraction)
const services = [
  'auth-service', 'product-service', 'menu-service', 'inventory-service',
  'cart-service', 'order-service', 'payment-service', 'admin-service',
  'user-service', 'notification-service', 'analytics-service',
];
services.forEach((svc) => {
  const dir = path.join('services', svc);
  if (!fs.existsSync(dir)) throw new Error('Missing service directory: ' + svc);
  if (!fs.existsSync(path.join(dir, 'src', 'lambda.js'))) throw new Error('Missing lambda.js: ' + svc);
  const zip = path.join(dir, 'lambda.zip');
  if (!fs.existsSync(zip)) throw new Error('Missing lambda.zip: ' + svc);
  const stat = fs.statSync(zip);
  if (stat.size < 1000) throw new Error('lambda.zip suspiciously small for ' + svc);
  console.log('  ✅ ' + svc + ' — lambda.zip ' + (stat.size / 1024 / 1024).toFixed(1) + ' MB');
});
console.log('✅ All 11 service zips present and non-empty');

// 3. Terraform locals
const locals = fs.readFileSync('terraform/environments/dev/locals.tf', 'utf8');
services.forEach((svc) => {
  if (!locals.includes(svc)) throw new Error('Terraform locals.tf missing reference: ' + svc);
});
const jwtMarker = 'authorization_type = "JWT"';
if (!locals.includes(jwtMarker)) throw new Error('Terraform locals.tf missing JWT authorizer configuration');
console.log('✅ Terraform environment locals.tf verified');

console.log('\n' + JSON.stringify({ verified: true, services, terraformRoot: 'terraform/environments/dev' }, null, 2));
