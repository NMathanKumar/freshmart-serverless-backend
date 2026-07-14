const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const AdmZip = require("adm-zip");
const rootDir = path.resolve(__dirname, '..');
const terraformEnvDirs = ['dev'];

const requiredServices = {
  auth: 'auth-service',
  product: 'product-service',
  menu: 'menu-service',
  inventory: 'inventory-service',
  cart: 'cart-service',
  order: 'order-service',
  payment: 'payment-service',
  notification: 'notification-service',
  analytics: 'analytics-service',
  admin: 'admin-service',
  user: 'user-service',
};

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

const assertExists = (filePath, message) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(message || `Missing required file: ${filePath}`);
  }
};

const verifyRootScripts = () => {
  const packageJson = JSON.parse(
    readText(path.join(rootDir, 'package.json'))
  );

  if (!packageJson.scripts || !packageJson.scripts['package:menu']) {
    throw new Error(
      'Root package.json is missing the package:menu script'
    );
  }

  if (!packageJson.scripts['verify:deployment']) {
    throw new Error(
      'Root package.json is missing the verify:deployment script'
    );
  }
};

const verifyWorkspaceHandlers = () => {
  for (const [serviceName, folderName] of Object.entries(requiredServices)) {
    const serviceDir = path.join(rootDir, 'services', folderName);

    assertExists(
      serviceDir,
      `Missing service directory for ${serviceName}: ${serviceDir}`
    );

    assertExists(
      path.join(serviceDir, 'package.json'),
      `Missing package.json for ${serviceName}`
    );

    assertExists(
      path.join(serviceDir, 'src', 'lambda.js'),
      `Missing Lambda handler for ${serviceName}`
    );
  }
};

const verifyTerraformTopology = () => {
  const requiredNeedles = [
    'catalog_items',
    'menu = {',
    'auth = {',
    'admin = {',
    'user = {',
    'menu_search = {',
    'menu_list = {',
    'menu_get = {',
    'menu_create = {',
    'menu_update = {',
    'menu_availability = {',
    'menu_delete = {',
   
  ];

  for (const env of terraformEnvDirs) {
    const localsPath = path.join(
      rootDir,
      'terraform',
      'environments',
      env,
      'locals.tf'
    );

    assertExists(localsPath, `Missing Terraform locals for ${env}`);

    const contents = readText(localsPath);

    for (const needle of requiredNeedles) {
      if (!contents.includes(needle)) {
        throw new Error(
          `Terraform validation failed for ${env}: missing '${needle}' in locals.tf`
        );
      }
    }

    const envDir = path.join(
      rootDir,
      'terraform',
      'environments',
      env
    );

    try {
      execFileSync(
         'terraform',
         [`-chdir=${envDir}`, 'validate'],
          {
       stdio: 'inherit',
       }
     );
    } catch (error) {
      throw new Error(
        `terraform validate failed for ${env}: ${error.message}`
      );
    }
  }
};



const verifyWorkspaceResolution = () => {
  try {
    const npmCli = require.resolve("npm/bin/npm-cli.js");

    execFileSync(
      process.execPath,
      [
        npmCli,
        "ls",
        "--workspaces",
        "--omit=dev",
        "--json"
      ],
      {
        cwd: rootDir,
        stdio: "pipe",
      }
    );
  } catch (error) {
    const stderr = error.stderr
      ? error.stderr.toString("utf8")
      : error.message;

    throw new Error(`npm workspace resolution failed: ${stderr}`);
  }
};


const verifyPackagedArtifacts = () => {
  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    return;
  }

  for (const folderName of Object.values(requiredServices)) {
    const zipPath = path.join(
      rootDir,
      'services',
      folderName,
      'lambda.zip'
    );

    if (!fs.existsSync(zipPath)) {
      continue;
    }

    const zip = new AdmZip(zipPath);

    const entries = zip
      .getEntries()
      .map((entry) => entry.entryName.replace(/\\/g, '/'));

    if (!entries.includes('package.json')) {
      throw new Error(
        `Packaged artifact is missing package.json: ${zipPath}`
      );
    }

    if (!entries.includes('src/lambda.js')) {
      throw new Error(
        `Packaged artifact is missing src/lambda.js: ${zipPath}`
      );
    }

    if (!entries.some((entry) => entry.startsWith('node_modules/'))) {
      throw new Error(
        `Packaged artifact is missing node_modules: ${zipPath}`
      );
    }
  }
};

const main = () => {
  verifyRootScripts();
  verifyWorkspaceHandlers();
  verifyTerraformTopology();
  verifyPackagedArtifacts();

  console.log(
    JSON.stringify(
      {
        verified: true,
        services: Object.keys(requiredServices),
        terraformEnvironments: terraformEnvDirs,
      },
      null,
      2
    )
  );
};

if (require.main === module) {
  main();
}