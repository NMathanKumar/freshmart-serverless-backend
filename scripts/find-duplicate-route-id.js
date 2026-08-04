import { routeTree } from '../apps/customer-web/src/routeTree.gen.ts';

console.log('--- INSPECTING ALL ROUTES IN ROUTETREE ---');

const routesById = {};
const duplicates = [];

const walkRoute = (route) => {
  if (!route) return;
  const id = route.id || route.fullPath || route.path;
  if (id) {
    if (routesById[id]) {
      duplicates.push({ id, existing: routesById[id], newRoute: route });
      console.error(`[DUPLICATE ROUTE ID DETECTED] id: "${id}"`);
    } else {
      routesById[id] = route;
    }
  }
  if (route.children) {
    for (const child of route.children) {
      walkRoute(child);
    }
  }
};

if (routeTree) {
  walkRoute(routeTree);
}

console.log('Total unique routes found:', Object.keys(routesById).length);
console.log('Total duplicates found:', duplicates.length);

if (duplicates.length > 0) {
  console.log('DUPLICATES DETAILS:', JSON.stringify(duplicates, null, 2));
}
