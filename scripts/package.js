const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const services = {
  auth: { dir: 'services/auth-service', zip: 'auth.zip' },
  product: { dir: 'services/product-service', zip: 'product.zip' },
  menu: { dir: 'services/menu-service', zip: 'menu.zip' },
  inventory: { dir: 'services/inventory-service', zip: 'inventory.zip' },
  cart: { dir: 'services/cart-service', zip: 'cart.zip' },
  order: { dir: 'services/order-service', zip: 'order.zip' },
  payment: { dir: 'services/payment-service', zip: 'payment.zip' },
  notification: { dir: 'services/notification-service', zip: 'notification.zip' },
  analytics: { dir: 'services/analytics-service', zip: 'analytics.zip' },
  admin: { dir: 'services/admin-service', zip: 'admin.zip' },
  user: { dir: 'services/user-service', zip: 'user.zip' },
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const installProductionDependencies = (serviceDir) => {
  const lockFileExists = fs.existsSync(path.join(serviceDir, 'package-lock.json'));
  const nodeModulesExists = fs.existsSync(path.join(serviceDir, 'node_modules'));
  if (lockFileExists && nodeModulesExists) {
    execFileSync('node', [path.join(serviceDir, '..', '_shared', 'materialize-local-deps.js')], {
      cwd: serviceDir,
      stdio: 'inherit',
    });
    return;
  }

  const installWithFallback = () => {
    try {
      execSync('npm ci --omit=dev', {
        cwd: serviceDir,
        stdio: 'inherit',
        shell: true,
      });
    } catch (error) {
      execSync('npm install --omit=dev', {
        cwd: serviceDir,
        stdio: 'inherit',
        shell: true,
      });
    }
  };

  if (lockFileExists) {
    installWithFallback();
  } else {
    execSync('npm install --omit=dev', {
      cwd: serviceDir,
      stdio: 'inherit',
      shell: true,
    });
  }

  execFileSync('node', [path.join(serviceDir, '..', '_shared', 'materialize-local-deps.js')], {
    cwd: serviceDir,
    stdio: 'inherit',
  });
};

const removeTypeScriptFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeTypeScriptFiles(entryPath);
      continue;
    }
    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      fs.rmSync(entryPath, { force: true });
    }
  }
};

const removeZipArtifacts = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeZipArtifacts(entryPath);
      continue;
    }
    if (entry.name.endsWith('.zip')) {
      fs.rmSync(entryPath, { force: true });
    }
  }
};

const createZip = (serviceDir, zipPath) => {
  const attempts = process.platform === 'win32' ? 3 : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      if (process.platform === 'win32') {
        const command = [
          '$ErrorActionPreference = "Stop";',
          `$source = ${JSON.stringify(path.join(serviceDir, '*'))};`,
          `$destination = ${JSON.stringify(zipPath)};`,
          'Compress-Archive -Path $source -DestinationPath $destination -Force;',
        ].join(' ');

        execFileSync('powershell', ['-NoProfile', '-Command', command], {
          stdio: 'inherit',
        });
      } else {
        execFileSync('tar', ['-a', '-c', '-f', zipPath, '-C', serviceDir, '.'], {
          stdio: 'inherit',
        });
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        throw error;
      }

      if (process.platform === 'win32') {
        execFileSync('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Seconds 2'], {
          stdio: 'inherit',
        });
      }
    }
  }

  throw lastError;
};

const stagePackage = (serviceName) => {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Unknown service '${serviceName}'. Expected one of: ${Object.keys(services).join(', ')}`);
  }

  const serviceDir = path.join(rootDir, service.dir);
  const distZipPath = path.join(distDir, service.zip);
  const lambdaZipPath = path.join(serviceDir, 'lambda.zip');

  if (!fs.existsSync(serviceDir)) {
    throw new Error(`Missing service directory: ${serviceDir}`);
  }

  ensureDir(distDir);
  removeTypeScriptFiles(serviceDir);
  removeZipArtifacts(serviceDir);
  installProductionDependencies(serviceDir);
  createZip(serviceDir, lambdaZipPath);

  try {
    fs.copyFileSync(lambdaZipPath, distZipPath);
  } catch (error) {
    // The deployable artifact is the service-local ZIP; dist/ is a convenience copy.
    if (error.code !== 'EBUSY') {
      throw error;
    }
  }

  return lambdaZipPath;
};

const main = () => {
  const target = process.argv[2] || 'all';

  if (target === 'all') {
    return Object.keys(services).map((serviceName) => stagePackage(serviceName));
  }

  return [stagePackage(target)];
};

if (require.main === module) {
  const outputs = main();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ packaged: outputs }, null, 2));
}

module.exports = {
  services,
  stagePackage,
};
