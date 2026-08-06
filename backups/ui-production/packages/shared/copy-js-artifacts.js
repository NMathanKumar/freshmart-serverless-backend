const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const targets = [
  path.join(__dirname, 'dist', 'cjs'),
  path.join(__dirname, 'dist', 'esm')
];

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stats.isFile()) {
    if (src.endsWith('.js')) {
      fs.copyFileSync(src, dest);
    }
  }
}

for (const target of targets) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir);
  for (const entry of entries) {
    if (entry === 'index.js' || entry === 'routing.js') continue;
    copyRecursive(path.join(srcDir, entry), path.join(target, entry));
  }
}
console.log('Successfully copied JavaScript backend artifacts to dist/cjs and dist/esm!');
