import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(process.cwd(), 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const allSrcFiles = getAllFiles(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

console.log("=== 2. Lazy Loading Audit ===");
const routerPath = path.join(srcDir, 'app', 'router.tsx');
if (fs.existsSync(routerPath)) {
    const routerContent = fs.readFileSync(routerPath, 'utf-8');
    const lazyLoads = routerContent.match(/lazy\(\(\) => import\(['"](.*?)['"]\)/g);
    if (lazyLoads) {
        lazyLoads.forEach(load => {
            console.log(load);
        });
    }
}

console.log("\n=== 3. Import Boundary Audit ===");
const migratedFeatures = ['inventory', 'products', 'orders', 'customers', 'settings', 'analytics'];
allSrcFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
    imports.forEach(imp => {
        const importPath = imp.replace(/from\s+['"]/, '').replace(/['"]/, '');
        if (file.includes('features\\')) {
            const currentFeature = file.split('features\\')[1].split('\\')[0];
            if (migratedFeatures.includes(currentFeature)) {
                if (importPath.includes('../') || importPath.includes('../../')) {
                    const resolvedPath = path.resolve(path.dirname(file), importPath);
                    if (resolvedPath.includes('features\\')) {
                        const targetFeature = resolvedPath.split('features\\')[1].split('\\')[0];
                        if (currentFeature !== targetFeature && targetFeature !== 'admin' && targetFeature !== 'shared') {
                             console.log(`VIOLATION: ${currentFeature} imports from ${targetFeature} in ${file}`);
                        }
                    }
                }
            }
        }
        if (importPath.includes('admin/pages')) {
            console.log(`LEGACY IMPORT VIOLATION: ${file} imports ${importPath}`);
        }
    });
});

console.log("\n=== 4. Shared Component Audit ===");
const sharedDir = path.join(srcDir, 'shared');
if (fs.existsSync(sharedDir)) {
    const sharedFiles = getAllFiles(sharedDir);
    sharedFiles.forEach(file => {
        const basename = path.basename(file).toLowerCase();
        if (basename.includes('admin') || basename.includes('shell') || basename.includes('sidebar')) {
            console.log(`POTENTIAL SHARED VIOLATION: ${file}`);
        }
    });
}

console.log("\n=== 5. Service Layer Audit ===");
allSrcFiles.forEach(file => {
    if (file.includes('pages\\') || file.includes('components\\')) {
        const content = fs.readFileSync(file, 'utf-8');
        // Match exact "fetch(" avoiding "refetch("
        if (/[^a-zA-Z0-9]fetch\(/.test(content) || /^fetch\(/.test(content) || content.includes('axios.')) {
            console.log(`SERVICE VIOLATION: fetch/axios used in UI layer: ${file}`);
        }
    }
});

console.log("\n=== Audit Complete ===");
