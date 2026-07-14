const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const archiver = require('archiver');
const AdmZip = require('adm-zip');

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

  // Migrate local materialization from services/_shared -> scripts/materialize-local-deps.js
  const materializeScript = path.join(rootDir, 'scripts', 'materialize-local-deps.js');

  const installWithFallback = () => {
    try {
      execSync('npm ci --omit=dev --workspaces=false --install-links', {
        cwd: serviceDir,
        stdio: 'inherit',
        shell: true,
      });
    } catch (error) {
      execSync('npm install --omit=dev --workspaces=false --install-links', {
        cwd: serviceDir,
        stdio: 'inherit',
        shell: true,
      });
    }
  };

  if (lockFileExists) {
    installWithFallback();
  } else {
    execSync('npm install --omit=dev --workspaces=false --install-links', {
      cwd: serviceDir,
      stdio: 'inherit',
      shell: true,
    });
  }

  execFileSync('node', [materializeScript], {
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

const retryWithBackoff = (operation, { attempts = 5, initialDelayMs = 250 } = {}) => {
  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return operation();
    } catch (error) {
      const retryable = error.code === 'EPERM' || error.code === 'EBUSY';
      if (!retryable || attempt === attempts) {
        throw error;
      }

      execFileSync('powershell', ['-NoProfile', '-Command', `Start-Sleep -Milliseconds ${delayMs}`], {
        stdio: 'ignore',
      });
      delayMs *= 2;
    }
  }

  return null;
};

const removeFileIfExists = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  retryWithBackoff(() => fs.rmSync(filePath, { force: true }));
};

const removeZipFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeZipFiles(entryPath);
      continue;
    }

    if (entry.name.endsWith('.zip')) {
      removeFileIfExists(entryPath);
    }
  }
};

const copyFileWithRetry = (sourcePath, targetPath) => {
  retryWithBackoff(() => fs.copyFileSync(sourcePath, targetPath));
};

const verifyPackagedArtifact = (zipPath, serviceDir) => {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Missing generated ZIP artifact: ${zipPath}`);
  }

  const stats = fs.statSync(zipPath);
  if (stats.size <= 0) {
    throw new Error(`Generated ZIP artifact is empty: ${zipPath}`);
  }

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries().map((entry) => entry.entryName.replace(/\\/g, '/'));
  const requiredEntries = ['package.json', 'src/lambda.js'];

  for (const requiredEntry of requiredEntries) {
    if (!entries.includes(requiredEntry)) {
      throw new Error(`ZIP artifact is missing required entry '${requiredEntry}' for ${serviceDir}`);
    }
  }

  if (!entries.some((entry) => entry.startsWith('node_modules/'))) {
    throw new Error(`ZIP artifact does not include node_modules for ${serviceDir}`);
  }
};

const createZip = async (serviceDir, zipPath) => {
  await fs.promises.rm(zipPath, { force: true });

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', resolve);
    output.on('error', reject);

    archive.on('warning', (error) => {
      if (error.code === 'ENOENT') {
        return;
      }
      reject(error);
    });

    archive.on('error', reject);
    archive.pipe(output);

    archive.glob('**/*', {
      cwd: serviceDir,
      dot: true,
      ignore: [
        '.git/**',
        '.github/**',
        'coverage/**',
        'dist/**',
        'lambda.zip',
        '**/lambda.zip',
        '*.zip',
        '**/*.zip',
        '*.map',
        '**/*.map',
        '*.md',
        '**/*.md',
        'tests/**',
        'test/**',
        '__tests__/**',
      ],
    });

    void archive.finalize();
  });
};

const stagePackage = async (serviceName) => {
  const service = services[serviceName];
  if (!service) {
    throw new Error(`Unknown service '${serviceName}'. Expected one of: ${Object.keys(services).join(', ')}`);
  }

  const serviceDir = path.join(rootDir, service.dir);
  const distZipPath = path.join(distDir, service.zip);
  const lambdaZipPath = path.join(serviceDir, 'lambda.zip');
  const tempZipPath = path.join(distDir, `${serviceName}.staging.zip`);

  if (!fs.existsSync(serviceDir)) {
    throw new Error(`Missing service directory: ${serviceDir}`);
  }

  ensureDir(distDir);
  removeTypeScriptFiles(serviceDir);
  removeZipFiles(serviceDir);
  removeFileIfExists(distZipPath);
  removeFileIfExists(tempZipPath);
  installProductionDependencies(serviceDir);
  await createZip(serviceDir, tempZipPath);
  verifyPackagedArtifact(tempZipPath, serviceDir);

  try {
    copyFileWithRetry(tempZipPath, lambdaZipPath);
    copyFileWithRetry(tempZipPath, distZipPath);
  } catch (error) {
    // The deployable artifact is the service-local ZIP; dist/ is a convenience copy.
    if (error.code !== 'EBUSY' && error.code !== 'EPERM') {
      throw error;
    }
    throw error;
  } finally {
    removeFileIfExists(tempZipPath);
  }

  return lambdaZipPath;
};

const main = async () => {
  const target = process.argv[2] || 'all';

  if (target === 'all') {
    const outputs = [];
    for (const serviceName of Object.keys(services)) {
      outputs.push(await stagePackage(serviceName));
    }
    return outputs;
  }

  return [await stagePackage(target)];
};

if (require.main === module) {
  main()
    .then((outputs) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ packaged: outputs }, null, 2));
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = {
  services,
  stagePackage,
};
