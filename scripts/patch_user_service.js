const fs = require('fs');
const path = require('path');

// 1. user-service/src/routes/index.ts
const routesFile = path.resolve('services/user-service/src/routes/index.ts');
let routesContent = fs.readFileSync(routesFile, 'utf8');

// Replace { auth } with { auth } and pass auth.claims to getProfile
routesContent = routesContent.replace(/handler: \(\{ auth \}\) => controller\.getProfile\(auth\.subject \?\? ''\)/g, "handler: ({ auth }) => controller.getProfile(auth.subject ?? '', auth.claims)");

fs.writeFileSync(routesFile, routesContent);
console.log('Patched routes/index.ts');

// 2. user-service/src/controllers/index.ts
const controllersFile = path.resolve('services/user-service/src/controllers/index.ts');
let controllersContent = fs.readFileSync(controllersFile, 'utf8');

// Replace getProfile: async (userId: string) => jsonResponse(200, await service.getProfile(userId))
controllersContent = controllersContent.replace(/getProfile: async \(userId: string\) => jsonResponse\(200, await service\.getProfile\(userId\)\)/g, "getProfile: async (userId: string, claims?: Record<string, unknown>) => jsonResponse(200, await service.getProfile(userId, claims))");

fs.writeFileSync(controllersFile, controllersContent);
console.log('Patched controllers/index.ts');

// 3. user-service/src/services/index.ts
const servicesFile = path.resolve('services/user-service/src/services/index.ts');
let servicesContent = fs.readFileSync(servicesFile, 'utf8');

// Update createEmptyProfile signature
servicesContent = servicesContent.replace(/const createEmptyProfile = \(userId: string\): UserProfile => \{/g, "const createEmptyProfile = (userId: string, claims?: Record<string, unknown>): UserProfile => {");

// Prepopulate using claims
const prepopulateLogic = `
    firstName: typeof claims?.given_name === 'string' ? claims.given_name : '',
    lastName: typeof claims?.family_name === 'string' ? claims.family_name : '',
    email: typeof claims?.email === 'string' ? claims.email : '',
    phoneNumber: typeof claims?.phone_number === 'string' ? claims.phone_number : undefined,
`;
servicesContent = servicesContent.replace(/firstName: '',\s*lastName: '',\s*email: '',\s*phoneNumber: undefined,/g, prepopulateLogic);

// Update getProfile signature and call to createEmptyProfile
servicesContent = servicesContent.replace(/async getProfile\(userId: string\): Promise<UserProfile> \{/g, "async getProfile(userId: string, claims?: Record<string, unknown>): Promise<UserProfile> {");
servicesContent = servicesContent.replace(/const profile = createEmptyProfile\(userId\);/g, "const profile = createEmptyProfile(userId, claims);");

fs.writeFileSync(servicesFile, servicesContent);
console.log('Patched services/index.ts');
