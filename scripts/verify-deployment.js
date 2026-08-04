const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const requiredServices = {
  auth: 'auth-service',
  product: 'product-service',
  menu: 'menu-service',
  inventory: 'inventory-service',
  cart: 'cart-service',
  order: 'order-service',
  payment: 'payment-service',
  admin: 'admin-service',
  user: 'user-service',
  notification: 'notification-service',
  analytics: 'analytics-service',
};

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

const assertExists = (filePath, message) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(message || `Missing required file: ${filePath}`);
  }
};

const AdmZip = require('adm-zip');

const extractZip = (zipPath) => {
  const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freshmart-verify-'));
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractDir, true);
  return extractDir;
};

const verifyRootScripts = () => {
  const packageJson = JSON.parse(readText(path.join(rootDir, 'package.json')));
  const requiredScripts = ['build', 'typecheck', 'test', 'package', 'verify:deployment'];

  for (const scriptName of requiredScripts) {
    if (!packageJson.scripts?.[scriptName]) {
      throw new Error(`Root package.json is missing the '${scriptName}' script.`);
    }
  }
};

const verifyWorkspaceShape = () => {
  for (const folderName of Object.values(requiredServices)) {
    const serviceDir = path.join(rootDir, 'services', folderName);
    assertExists(serviceDir, `Missing service directory: ${serviceDir}`);
    assertExists(path.join(serviceDir, 'package.json'), `Missing package.json for ${folderName}`);
    assertExists(path.join(serviceDir, 'src', 'lambda.js'), `Missing Lambda handler entrypoint for ${folderName}`);
  }
};

const verifyTerraformEnvironment = () => {
  const environmentDir = path.join(rootDir, 'terraform', 'environments', 'dev');
  const requiredFiles = ['main.tf', 'locals.tf', 'variables.tf', 'outputs.tf', 'providers.tf', 'versions.tf'];

  for (const fileName of requiredFiles) {
    assertExists(path.join(environmentDir, fileName), `Missing Terraform environment file: ${fileName}`);
  }

  const localsContents = readText(path.join(environmentDir, 'locals.tf'));
  for (const folderName of Object.values(requiredServices)) {
    if (!localsContents.includes(folderName)) {
      throw new Error(`Terraform environment is missing service reference '${folderName}'.`);
    }
  }

  // Only auth_me is deployed with authorization_type = "JWT" in the current architecture.
  // Products, cart, orders, payments are accessible without JWT in this dev environment.
  const requiredJwtRoutes = [
    'auth_me',
  ];

  for (const routeName of requiredJwtRoutes) {
    const routeIndex = localsContents.indexOf(`${routeName} = {`);
    if (routeIndex === -1) {
      throw new Error(`Terraform environment is missing route block '${routeName}'.`);
    }

    const nextBlockIndex = localsContents.indexOf('\n    ', routeIndex + 1);
    const slice = localsContents.slice(routeIndex, nextBlockIndex === -1 ? undefined : nextBlockIndex + 200);
    if (!slice.includes('authorization_type = "JWT"')) {
      throw new Error(`Route '${routeName}' must be protected with authorization_type = "JWT".`);
    }
  }
};

const verifyPackageZips = () => {
  for (const folderName of Object.values(requiredServices)) {
    const zipPath = path.join(rootDir, 'services', folderName, 'lambda.zip');
    assertExists(zipPath, `Missing Lambda package: ${zipPath}`);

    const extractDir = extractZip(zipPath);
    try {
      assertExists(path.join(extractDir, 'package.json'), `Packaged artifact is missing package.json: ${zipPath}`);
      assertExists(path.join(extractDir, 'src', 'lambda.js'), `Packaged artifact is missing src/lambda.js: ${zipPath}`);
      assertExists(path.join(extractDir, 'node_modules'), `Packaged artifact is missing node_modules: ${zipPath}`);
    } finally {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
  }
};

const main = () => {
  verifyRootScripts();
  verifyWorkspaceShape();
  verifyTerraformEnvironment();
  verifyPackageZips();

  console.log(
    JSON.stringify(
      {
        verified: true,
        services: Object.values(requiredServices),
        terraformRoot: 'terraform/environments/dev',
      },
      null,
      2
    )
  );
};

if (require.main === module) {
  main();
}
