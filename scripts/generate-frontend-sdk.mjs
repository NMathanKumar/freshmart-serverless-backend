import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contracts = [
  ['auth', 'services/auth-service/openapi/openapi.json'],
  ['catalog', 'services/catalog-service/openapi/openapi.json'],
  ['category', 'services/category-service/openapi/openapi.json'],
  ['cart', 'services/cart-service/openapi/openapi.json'],
  ['order', 'services/order-service/openapi/openapi.json'],
  ['wishlist', 'services/wishlist-service/openapi/openapi.json'],
  ['notification', 'services/notification-service/openapi/openapi.json'],
  ['customerBff', 'services/customer-bff-service/openapi/openapi.json'],
  ['adminBff', 'services/admin-bff-service/openapi/openapi.json']
];

const generatedDir = join(rootDir, 'packages', 'api-sdk', 'src', 'generated');
mkdirSync(generatedDir, { recursive: true });

for (const [name, relativeInput] of contracts) {
  const input = join(rootDir, relativeInput);
  const output = join(generatedDir, `${name}.ts`);
  execSync(`npx openapi-typescript "${input}" -o "${output}"`, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
}
