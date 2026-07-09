const fs = require('fs');
const path = require('path');

const isDirectoryLink = (dirent) => dirent.isSymbolicLink();

const replaceLinkWithCopy = (linkPath) => {
  const realTarget = fs.realpathSync(linkPath);
  const stat = fs.statSync(realTarget);
  if (!stat.isDirectory()) {
    return;
  }

  fs.rmSync(linkPath, { recursive: true, force: true });
  fs.cpSync(realTarget, linkPath, { recursive: true, force: true, dereference: true });

  const nestedNodeModules = path.join(linkPath, 'node_modules');
  if (fs.existsSync(nestedNodeModules)) {
    fs.rmSync(nestedNodeModules, { recursive: true, force: true });
  }
};

const flattenPackageTrees = (scopeDir) => {
  if (!fs.existsSync(scopeDir)) {
    return;
  }

  for (const entry of fs.readdirSync(scopeDir, { withFileTypes: true })) {
    const entryPath = path.join(scopeDir, entry.name);
    if (!isDirectoryLink(entry)) {
      continue;
    }

    replaceLinkWithCopy(entryPath);
  }
};

const main = () => {
  const cwd = process.cwd();
  const scopeDir = path.join(cwd, 'node_modules', '@freshmart');
  flattenPackageTrees(scopeDir);
};

if (require.main === module) {
  main();
}

module.exports = { flattenPackageTrees };
