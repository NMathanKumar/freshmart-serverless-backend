const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');

const services = {
  auth: { folder: 'auth-service', packageName: '@freshmart/auth-service' },
  product: { folder: 'product-service', packageName: '@freshmart/product-service' },
  menu: { folder: 'menu-service', packageName: '@freshmart/menu-service' },
  inventory: { folder: 'inventory-service', packageName: '@freshmart/inventory-service' },
  cart: { folder: 'cart-service', packageName: '@freshmart/cart-service' },
  order: { folder: 'order-service', packageName: '@freshmart/order-service' },
  payment: { folder: 'payment-service', packageName: '@freshmart/payment-service' },
  admin: { folder: 'admin-service', packageName: '@freshmart/admin-service' },
  user: { folder: 'user-service', packageName: '@freshmart/user-service' },
  notification: { folder: 'notification-service', packageName: '@freshmart/notification-service' },
  analytics: { folder: 'analytics-service', packageName: '@freshmart/analytics-service' },
  customerBff: { folder: 'customer-bff-service', packageName: '@freshmart/customer-bff-service' },
  review: { folder: 'review-service', packageName: '@freshmart/review-service' },
  warehouse: { folder: 'warehouse-service', packageName: '@freshmart/warehouse-service' },
  coupon: { folder: 'coupon-service', packageName: '@freshmart/coupon-service' },
};

const sleep = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

const listWorkspacePackageNames = () => {
  const packageNames = new Set();
  const candidates = [path.join(rootDir, 'packages'), path.join(rootDir, 'services')];

  for (const baseDir of candidates) {
    if (!fs.existsSync(baseDir)) {
      continue;
    }

    for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(baseDir, entry.name, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        continue;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.name) {
        packageNames.add(packageJson.name);
      }
    }
  }

  return packageNames;
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const removeIfExists = (targetPath) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!fs.existsSync(targetPath)) {
      return;
    }

    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      if ((error.code !== 'EPERM' && error.code !== 'EBUSY') || attempt === 4) {
        throw error;
      }
      sleep(250 * (attempt + 1));
    }
  }
};

const copyRecursive = (sourcePath, targetPath) => {
  const stats = fs.statSync(sourcePath);
  if (stats.isDirectory()) {
    ensureDir(targetPath);
    for (const entry of fs.readdirSync(sourcePath)) {
      copyRecursive(path.join(sourcePath, entry), path.join(targetPath, entry));
    }
    return;
  }

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
};

const execNpm = (args, cwd = rootDir) => {
  execSync(`npm ${args.join(' ')}`, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
};

const runNodeScript = (scriptPath, cwd, env = {}) => {
  execSync(`node "${scriptPath}"`, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ...env,
    },
  });
};

const writeStagingPackageJson = (serviceDir, stagingDir) => {
  const packageJsonPath = path.join(serviceDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const workspacePackageNames = listWorkspacePackageNames();

  // Collect transitive dependencies from workspace packages.
  // A dep is a workspace package if either:
  //   (a) its name is in workspacePackageNames, OR
  //   (b) its spec is a file: reference pointing to a directory with a package.json
  const transitiveDeps = {};
  const workspaceDepNames = new Set(); // Track all dep keys that are workspace packages

  for (const [depName, depSpec] of Object.entries(packageJson.dependencies || {})) {
    let workspacePkgDir;

    if (workspacePackageNames.has(depName)) {
      workspaceDepNames.add(depName);
      // Find directory by searching workspace
      for (const base of [path.join(rootDir, 'packages'), path.join(rootDir, 'services')]) {
        if (!fs.existsSync(base)) continue;
        for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const pkgJsonPath = path.join(base, entry.name, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            if (pkg.name === depName) {
              workspacePkgDir = path.join(base, entry.name);
              break;
            }
          }
        }
        if (workspacePkgDir) break;
      }
    } else if (typeof depSpec === 'string' && depSpec.startsWith('file:')) {
      // Could be a workspace package with a different dep key name (e.g., @freshmart/service-shared -> @freshmart/shared)
      const resolved = path.resolve(serviceDir, depSpec.slice('file:'.length));
      if (fs.existsSync(path.join(resolved, 'package.json'))) {
        const resolvedPkg = JSON.parse(fs.readFileSync(path.join(resolved, 'package.json'), 'utf8'));
        if (resolvedPkg.name && workspacePackageNames.has(resolvedPkg.name)) {
          workspaceDepNames.add(depName);
          workspacePkgDir = resolved;
        }
      }
    }

    if (workspacePkgDir && fs.existsSync(path.join(workspacePkgDir, 'package.json'))) {
      const workspacePkg = JSON.parse(fs.readFileSync(path.join(workspacePkgDir, 'package.json'), 'utf8'));
      for (const [tdName, tdSpec] of Object.entries(workspacePkg.dependencies || {})) {
        // Skip workspace-to-workspace deps (those get materialized separately)
        if (workspacePackageNames.has(tdName)) continue;
        if (typeof tdSpec === 'string' && tdSpec.startsWith('file:')) continue;
        transitiveDeps[tdName] = tdSpec;
      }
    }
  }

  const dependencies = Object.fromEntries(
    Object.entries(packageJson.dependencies || {}).filter(([depName, depSpec]) => {
      // Filter out all workspace deps (they get materialized by materialize-local-deps.js)
      if (workspaceDepNames.has(depName)) {
        return false;
      }

      return typeof depSpec !== 'string' || !depSpec.startsWith('file:');
    })
  );

  const stagingPackageJson = {
    ...packageJson,
    dependencies: {
      ...transitiveDeps,
      ...dependencies,
      "zod": "^3.25.76"
    },
  };

  fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(stagingPackageJson, null, 2));
};

const zipDirectory = (sourceDir, zipPath) => {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceDir);
  zip.writeZip(zipPath);
};

const createZip = async (serviceDir, zipPath) => {
  removeIfExists(zipPath);
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freshmart-package-'));

  try {
    writeStagingPackageJson(serviceDir, stagingDir);

    const packageLockPath = path.join(serviceDir, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
      copyRecursive(packageLockPath, path.join(stagingDir, 'package-lock.json'));
    }

    copyRecursive(path.join(serviceDir, 'src'), path.join(stagingDir, 'src'));

    const distDir = path.join(serviceDir, 'dist');
    if (fs.existsSync(distDir)) {
      copyRecursive(distDir, path.join(stagingDir, 'dist'));
    }

    const openApiDir = path.join(serviceDir, 'openapi');
    if (fs.existsSync(openApiDir)) {
      copyRecursive(openApiDir, path.join(stagingDir, 'openapi'));
    }

    installRuntimeDependencies(stagingDir);
    copyRecursive(path.join(serviceDir, 'package.json'), path.join(stagingDir, 'package.json'));
    runNodeScript(path.join(rootDir, 'scripts', 'materialize-local-deps.js'), stagingDir, {
      LOCAL_DEPS_BASE_DIR: serviceDir,
    });
    zipDirectory(stagingDir, zipPath);
  } finally {
    removeIfExists(stagingDir);
  }
};

const extractZipForVerification = (zipPath) => {
  const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freshmart-package-check-'));
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractDir, true);
  return extractDir;
};

const verifyPackageZip = (zipPath, folder) => {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Missing generated ZIP artifact: ${zipPath}`);
  }

  const extractDir = extractZipForVerification(zipPath);
  try {
    const requiredPaths = ['package.json', path.join('src', 'lambda.js'), 'node_modules'];
    for (const relativePath of requiredPaths) {
      if (!fs.existsSync(path.join(extractDir, relativePath))) {
        throw new Error(`ZIP artifact for ${folder} is missing '${relativePath}'.`);
      }
    }
  } finally {
    removeIfExists(extractDir);
  }
};

const installRuntimeDependencies = (serviceDir) => {
  execNpm(['install', '--omit=dev', '--package-lock=false'], serviceDir);
};

const stagePackage = async (serviceKey) => {
  const service = services[serviceKey];
  if (!service) {
    throw new Error(`Unknown service '${serviceKey}'. Expected one of: ${Object.keys(services).join(', ')}`);
  }

  const serviceDir = path.join(rootDir, 'services', service.folder);
  const zipPath = path.join(serviceDir, 'lambda.zip');

  ensureDir(serviceDir);
  await createZip(serviceDir, zipPath);
  verifyPackageZip(zipPath, service.folder);

  return zipPath;
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
      console.log(JSON.stringify({ packaged: outputs }, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = {
  services,
  stagePackage,
};
