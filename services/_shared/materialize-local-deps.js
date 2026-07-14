// Backward-compat shim.
// The project migrated from services/_shared -> packages/shared, but existing tooling may still invoke:
//   node ../_shared/materialize-local-deps.js
//
// This file intentionally does nothing because npm workspaces + file: deps should already
// resolve @freshmart/service-shared during packaging.
module.exports = {};

