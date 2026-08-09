import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const servicesDir = path.resolve(process.cwd(), 'services');

const openApiFiles = readdirSync(servicesDir)
  .map((serviceName) => path.join(servicesDir, serviceName, 'openapi', 'openapi.json'))
  .filter((filePath) => {
    try {
      return statSync(filePath).isFile();
    } catch {
      return false;
    }
  });

test('all openapi contracts use /api/v1 paths and include problem responses', () => {
  assert.ok(openApiFiles.length > 0);

  for (const filePath of openApiFiles) {
    const document = JSON.parse(readFileSync(filePath, 'utf8')) as {
      paths?: Record<string, Record<string, { responses?: Record<string, unknown> }>>;
    };

    const paths = document.paths ?? {};
    for (const [routePath, operations] of Object.entries(paths)) {
      assert.equal(routePath.startsWith('/api/v1') || routePath.startsWith('/v1'), true, `${filePath} contains non-standard path ${routePath}`);
      for (const operation of Object.values(operations)) {
        assert.ok(operation.responses, `${filePath} operation for ${routePath} is missing responses`);
      }
    }
  }
});
