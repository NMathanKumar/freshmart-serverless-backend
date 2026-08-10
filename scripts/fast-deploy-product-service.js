const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist-lambda');
const zipPath = path.join(rootDir, 'fast-product-service.zip');

console.log('1. Bundling product-service with esbuild...');
execSync('npx esbuild services/product-service/src/lambda.js --bundle --platform=node --target=node22 --outfile=dist-lambda/index.js --external:@aws-sdk/*', { cwd: rootDir, stdio: 'inherit' });

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('2. Zipping single bundle file...');
const psCommand = `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`;
execSync(psCommand, { stdio: 'inherit' });

const stats = fs.statSync(zipPath);
console.log(`Zip created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

console.log('3. Updating Lambda freshmart-dev-product-service code & handler...');
execSync(`aws lambda update-function-configuration --function-name freshmart-dev-product-service --handler index.handler`, { stdio: 'inherit' });
execSync(`aws lambda update-function-code --function-name freshmart-dev-product-service --zip-file fileb://${zipPath}`, { stdio: 'inherit' });

console.log('⚡ Product Service Lambda successfully deployed in seconds!');
