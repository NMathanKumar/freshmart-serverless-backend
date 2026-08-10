const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building packages/shared...');
const rootDir = path.resolve(__dirname, '..');
execSync('npm run build --workspace=@freshmart/shared', { cwd: rootDir, stdio: 'inherit' });

console.log('Preparing temp deployment directory for order-service...');
const tempDir = path.join(rootDir, 'temp-order-service-deploy');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Copy src, package.json
fs.cpSync(path.join(rootDir, 'services', 'order-service', 'src'), path.join(tempDir, 'src'), { recursive: true });
fs.copyFileSync(path.join(rootDir, 'services', 'order-service', 'package.json'), path.join(tempDir, 'package.json'));

const nodeModulesTarget = path.join(tempDir, 'node_modules');
fs.mkdirSync(nodeModulesTarget, { recursive: true });

console.log('Copying runtime node_modules...');
const sourceNodeModules = path.join(rootDir, 'node_modules');
const excluded = new Set([
  '@freshmart', 'aws-sdk', '@aws-sdk', '.bin', '.cache', 'playwright', 'playwright-core', 'puppeteer', 'puppeteer-core',
  'typescript', 'esbuild', '@esbuild', 'vite', '@vitejs', 'rollup', '@rollup', 'cypress', 'jsdom',
  '@swc', 'webpack', 'terser', 'prettier', 'eslint', '@eslint', '@typescript-eslint',
  'aws-sdk-client-mock', 'ts-node', 'ts-node-dev', 'lucide-react', '@rolldown', 'java-invoke-local',
  '@redocly', '@tailwindcss', 'swagger-ui-dist', 'lightningcss-win32-x64-msvc', '@babel',
  '@tanstack', 'react-dom', 'react', '@reduxjs', 'swagger-jsdoc', 'framer-motion', 'react-router',
  '@serverless', 'serverless', 'json-refs', 'luxon', 'prettier-plugin-tailwindcss', 'recharts', 'rxjs', 'tailwindcss'
]);

const entries = fs.readdirSync(sourceNodeModules);
for (const entry of entries) {
  if (excluded.has(entry)) continue;
  const srcPath = path.join(sourceNodeModules, entry);
  const destPath = path.join(nodeModulesTarget, entry);
  try {
    fs.cpSync(srcPath, destPath, { recursive: true });
  } catch (err) {
    // Ignore symlink/permission errors
  }
}

// Override @freshmart/service-shared with compiled packages/shared ONLY
const freshmartTarget = path.join(nodeModulesTarget, '@freshmart');
fs.mkdirSync(freshmartTarget, { recursive: true });
fs.cpSync(path.join(rootDir, 'packages', 'shared'), path.join(freshmartTarget, 'service-shared'), { recursive: true });
fs.cpSync(path.join(rootDir, 'packages', 'shared'), path.join(freshmartTarget, 'shared'), { recursive: true });

const zipPath = path.join(rootDir, 'order-service.zip');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('Zipping deployment package...');
const psCommand = `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`;
execSync(psCommand, { stdio: 'inherit' });

const stats = fs.statSync(zipPath);
console.log(`Package created: ${zipPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

console.log('Updating Lambda freshmart-dev-order-service...');
const updateCommand = `aws lambda update-function-code --function-name freshmart-dev-order-service --zip-file fileb://${zipPath}`;
execSync(updateCommand, { stdio: 'inherit' });

// Cleanup temp dir
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Order Service Lambda successfully updated!');
