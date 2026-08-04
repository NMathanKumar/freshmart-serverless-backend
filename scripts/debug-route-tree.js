import { routeTree } from '../apps/customer-web/src/routeTree.gen.js';

console.log('--- DEBUGGING ROUTE TREE NODES ---');

function inspectNode(node, path = '') {
  if (!node) return;
  console.log(`Node ID: "${node.id}", Path: "${node.path}", FullPath: "${node.fullPath}"`);

  if (node.children) {
    for (const child of node.children) {
      inspectNode(child, path + ' -> ' + node.id);
    }
  }
}

inspectNode(routeTree);
