import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('apps/admin-web/src/features');

const features = [
  { name: 'products', title: 'Products', icon: 'Package' },
  { name: 'categories', title: 'Categories', icon: 'Tag' },
  { name: 'inventory', title: 'Inventory', icon: 'Warehouse' },
  { name: 'orders', title: 'Orders', icon: 'ShoppingCart' },
  { name: 'customers', title: 'Customers', icon: 'Users' },
  { name: 'suppliers', title: 'Suppliers', icon: 'Truck' },
  { name: 'purchase-orders', title: 'Purchase Orders', icon: 'FileCheck' },
  { name: 'coupons', title: 'Coupons & Offers', icon: 'Ticket' },
  { name: 'analytics', title: 'Analytics', icon: 'BarChart3' },
  { name: 'reports', title: 'Reports', icon: 'FileSpreadsheet' },
  { name: 'reviews', title: 'Reviews', icon: 'Star' },
  { name: 'notifications', title: 'Notifications', icon: 'Bell' },
  { name: 'settings', title: 'Settings', icon: 'Settings' },
];

for (const feat of features) {
  const featDir = path.join(baseDir, feat.name);
  const dirs = ['components', 'pages', 'hooks', 'services', 'types', 'constants', 'utils', 'data'];

  for (const d of dirs) {
    fs.mkdirSync(path.join(featDir, d), { recursive: true });
  }

  const pascalName = feat.name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  // types
  fs.writeFileSync(
    path.join(featDir, 'types/index.ts'),
    `export interface ${pascalName}Item {\n  id: string;\n  name: string;\n}\n`
  );

  // data
  fs.writeFileSync(
    path.join(featDir, 'data/index.ts'),
    `import type { ${pascalName}Item } from '../types';\n\nexport const mock${pascalName}Data: ${pascalName}Item[] = [\n  { id: '1', name: '${feat.title} Sample Item' },\n];\n`
  );

  // services
  fs.writeFileSync(
    path.join(featDir, 'services/index.ts'),
    `import type { ${pascalName}Item } from '../types';\nimport { mock${pascalName}Data } from '../data';\n\nexport const ${feat.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Service = {\n  async getAll(): Promise<${pascalName}Item[]> {\n    return Promise.resolve(mock${pascalName}Data);\n  },\n};\n`
  );

  // constants
  fs.writeFileSync(
    path.join(featDir, 'constants/index.ts'),
    `export const ${feat.name.toUpperCase().replace(/-/g, '_')}_LIMIT = 20;\n`
  );

  // utils
  fs.writeFileSync(
    path.join(featDir, 'utils/index.ts'),
    `export function format${pascalName}Label(val: string): string {\n  return val.trim();\n}\n`
  );

  // pages
  fs.writeFileSync(
    path.join(featDir, `pages/${pascalName}Page.tsx`),
    `import React from 'react';\nimport { Card, CardTitle, CardDescription } from '../../../components/ui/card';\nimport { Badge } from '../../../components/ui/badge';\nimport { ${feat.icon} } from 'lucide-react';\n\nexport const ${pascalName}Page: React.FC = () => {\n  return (\n    <div className="space-y-6">\n      <div className="flex items-center justify-between">\n        <div>\n          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">\n            <${feat.icon} className="w-6 h-6 text-emerald-400" />\n            ${feat.title}\n          </h1>\n          <p className="text-xs text-slate-400 mt-1">\n            Manage store ${feat.name} (Placeholder Route - Ready for Screen Implementation)\n          </p>\n        </div>\n        <Badge variant="emerald">Foundation Ready</Badge>\n      </div>\n\n      <Card className="p-8 text-center glass-card border border-slate-800">\n        <CardTitle className="text-lg font-bold text-slate-200">${feat.title} Module Placeholder</CardTitle>\n        <CardDescription className="max-w-md mx-auto mt-2">\n          This route is registered in TanStack Router with placeholder service interfaces, data mock folders, and clean state support.\n        </CardDescription>\n      </Card>\n    </div>\n  );\n};\n`
  );

  // index.ts
  fs.writeFileSync(
    path.join(featDir, 'index.ts'),
    `export * from './types';\nexport * from './data';\nexport * from './services';\nexport * from './constants';\nexport * from './utils';\nexport * from './pages/${pascalName}Page';\n`
  );
}

console.log('All feature modules scaffolded successfully!');
