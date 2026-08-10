const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const FUNCTION_NAME = 'freshmart-dev-warehouse-service';
const OUT_DIR = path.resolve(__dirname, '../dist-lambda-warehouse');
const OUT_FILE = path.join(OUT_DIR, 'index.js');
const ZIP_FILE = path.join(OUT_DIR, 'bundle.zip');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('1. Bundling warehouse-service with esbuild...');
execSync(
  `npx esbuild services/warehouse-service/src/index.ts --bundle --platform=node --target=node22 --outfile=${OUT_FILE} --format=cjs --sourcemap=inline --external:@aws-sdk/*`,
  { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
);

console.log('2. Zipping single bundle file...');
const zip = new AdmZip();
zip.addLocalFile(OUT_FILE);
zip.writeZip(ZIP_FILE);

const stats = fs.statSync(ZIP_FILE);
console.log(`Zip created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

console.log(`3. Updating Lambda ${FUNCTION_NAME} code & handler...`);
execSync(
  `aws lambda update-function-code --function-name ${FUNCTION_NAME} --zip-file fileb://${ZIP_FILE}`,
  { stdio: 'inherit' }
);

execSync(
  `aws lambda update-function-configuration --function-name ${FUNCTION_NAME} --handler index.handler --timeout 30 --memory-size 512`,
  { stdio: 'inherit' }
);

console.log('⚡ Warehouse Service Lambda successfully deployed in seconds!');
