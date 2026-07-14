const fs = require('fs');
const path = require('path');

/**
 * Lambda ZIP correctness: ensure local workspace packages are NOT symlinks/links.
 *
 * Root cause fixed:
 * - npm workspaces + local file: deps may create symlinks or links on the dev machine.
 * - when we zip and upload to Lambda, the linked target may not exist inside /var/task,
 *   causing Runtime.ImportModuleError.
 *
 * This script materializes local workspace packages by copying their full directories into:
 *   <serviceDir>/node_modules/<package-name>
 *
 * Strategy (robust for future packages):
 * 1) Discover all local workspace packages under:
 *      packages/* (and services/* if they ever become reusable packages)
 * 2) For the current service, look at dependencies keys (depName).
 * 3) If depName exists in discovered local workspace packages, copy it into node_modules,
 *    regardless of how npm represents the spec (file:, workspace:, etc.).
 *
 * This avoids relying on the value being strictly "file:".
 */

const rootDir = path.resolve(__dirname, '..');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const listWorkspacePackageDirs = () => {
  const candidates = [path.join(rootDir, 'packages'), path.join(rootDir, 'services')];
  const dirs = [];

  for (const baseDir of candidates) {
    if (!fs.existsSync(baseDir)) continue;

    for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgDir = path.join(baseDir, entry.name);
      const pkgJson = path.join(pkgDir, 'package.json');
      if (fs.existsSync(pkgJson)) dirs.push(pkgDir);
    }
  }

  return dirs;
};

const copyDirRecursive = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // Skip symlinked node_modules (and other node_modules folders) to keep artifacts deterministic.
    if (entry.isDirectory() && entry.name === 'node_modules') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      // If it is a symlink (rare in package dirs), copyFileSync will copy the target content on most platforms.
      // This is acceptable for packaging determinism.
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const main = () => {
  const serviceDir = process.cwd();
  const nodeModulesDir = path.join(serviceDir, 'node_modules');

  if (!fs.existsSync(nodeModulesDir)) {
    throw new Error(`materialize-local-deps: missing node_modules in ${serviceDir}`);
  }

  const servicePkgPath = path.join(serviceDir, 'package.json');
  if (!fs.existsSync(servicePkgPath)) {
    throw new Error(`materialize-local-deps: missing package.json in ${serviceDir}`);
  }

  const servicePkg = readJson(servicePkgPath);
  const deps = Object.assign({}, servicePkg.dependencies || {});

  // Build: packageName -> sourceDir
  const workspacePkgDirs = listWorkspacePackageDirs();
  const workspaceByName = new Map();

  for (const pkgDir of workspacePkgDirs) {
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    const pkgJson = readJson(pkgJsonPath);

    if (!pkgJson.name) continue;
    // In case of duplicates (unexpected), last one wins deterministically.
    workspaceByName.set(pkgJson.name, pkgDir);
  }

  const localDeps = Object.entries(deps).flatMap(([depName, depSpec]) => {
    if (workspaceByName.has(depName)) {
      return [{ depName, sourceDir: workspaceByName.get(depName) }];
    }

    if (typeof depSpec !== 'string' || !depSpec.startsWith('file:')) {
      return [];
    }

    const sourceDir = path.resolve(serviceDir, depSpec.slice('file:'.length));
    if (!fs.existsSync(path.join(sourceDir, 'package.json'))) {
      throw new Error(`materialize-local-deps: missing local dependency ${depName}: ${sourceDir}`);
    }

    return [{ depName, sourceDir }];
  });

  if (localDeps.length === 0) {
    // Nothing to materialize; exit quietly to avoid breaking packaging for unrelated services.
    return;
  }

  for (const { depName, sourceDir: resolved } of localDeps) {
    if (!resolved || !fs.existsSync(resolved)) {
      throw new Error(`materialize-local-deps: cannot resolve workspace package ${depName}`);
    }

    const dest = path.join(nodeModulesDir, depName);

    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }

    const pkgJson = path.join(resolved, 'package.json');
    if (!fs.existsSync(pkgJson)) {
      throw new Error(`materialize-local-deps: resolved path missing package.json for ${depName}: ${resolved}`);
    }

    copyDirRecursive(resolved, dest);

    // Basic sanity checks for Node resolution.
    // Most internal packages expose src/index.js, but we don't enforce it.
    if (!fs.existsSync(path.join(dest, 'package.json'))) {
      throw new Error(`materialize-local-deps: copy failed, missing package.json in ${dest}`);
    }

    // Optional: avoid noisy logs, but keep minimal helpful info.
    // eslint-disable-next-line no-console
    console.log(`[materialize-local-deps] materialized ${depName} -> ${path.relative(serviceDir, dest)}`);
  }
};

if (require.main === module) {
  main();
}

