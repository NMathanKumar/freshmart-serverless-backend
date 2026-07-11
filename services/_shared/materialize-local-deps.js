const fs = require('fs');
const path = require('path');

const isDirectoryLink = (dirent) => dirent.isSymbolicLink();

const removeNestedNodeModules = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.name === 'node_modules') {
      fs.rmSync(entryPath, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory() && !entry.isSymbolicLink()) {
      removeNestedNodeModules(entryPath);
    }
  }
};

const replaceLinkWithCopy = (linkPath) => {
  const realTarget = fs.realpathSync(linkPath);
  const stat = fs.statSync(realTarget);
  if (!stat.isDirectory()) {
    return;
  }

  fs.rmSync(linkPath, { recursive: true, force: true });
  fs.cpSync(realTarget, linkPath, { recursive: true, force: true, dereference: true });
  removeNestedNodeModules(linkPath);
};

const flattenPackageTrees = (scopeDir) => {
  if (!fs.existsSync(scopeDir)) {
    return;
  }

  for (const entry of fs.readdirSync(scopeDir, { withFileTypes: true })) {
    const entryPath = path.join(scopeDir, entry.name);
    if (!isDirectoryLink(entry)) {
      if (entry.isDirectory()) {
        removeNestedNodeModules(entryPath);
      }
      continue;
    }

    replaceLinkWithCopy(entryPath);
  }
};

const main = () => {
  const cwd = process.cwd();
  const scopeDirs = ['@freshmart', '@canteen'];

  for (const scope of scopeDirs) {
    flattenPackageTrees(path.join(cwd, 'node_modules', scope));
  }
};

if (require.main === module) {
  main();
}

module.exports = { flattenPackageTrees };
