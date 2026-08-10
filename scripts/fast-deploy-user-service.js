const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist-lambda-user');
const outFile = path.join(distDir, 'index.js');
const zipPath = path.join(rootDir, 'fast-user-service.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('1. Bundling user-service with esbuild...');
execSync('npx esbuild services/user-service/src/lambda.js --bundle --platform=node --target=node22 --outfile=dist-lambda-user/index.js --external:@aws-sdk/*', { cwd: rootDir, stdio: 'inherit' });

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('2. Zipping single bundle file with AdmZip...');
const zip = new AdmZip();
zip.addLocalFile(outFile);
zip.writeZip(zipPath);

const stats = fs.statSync(zipPath);
console.log(`Zip created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

console.log('3. Updating Lambda freshmart-dev-user-service code...');
execSync(`aws lambda update-function-code --function-name freshmart-dev-user-service --zip-file fileb://${zipPath}`, { stdio: 'inherit' });

console.log('Waiting for function code update to complete...');
execSync(`aws lambda wait function-updated --function-name freshmart-dev-user-service`, { stdio: 'inherit' });

console.log('4. Updating Lambda handler to index.handler...');
execSync(`aws lambda update-function-configuration --function-name freshmart-dev-user-service --handler index.handler`, { stdio: 'inherit' });

console.log('⚡ User Service Lambda successfully deployed in seconds!');
