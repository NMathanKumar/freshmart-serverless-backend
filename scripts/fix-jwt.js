const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../terraform/environments/dev/locals.tf');
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('api_gateway_routes = {');
if (startIdx === -1) throw new Error('Not found');

let braceCount = 0;
let endIdx = -1;
let started = false;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    started = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (started && braceCount === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) throw new Error('End not found');

let routesBlock = content.substring(startIdx, endIdx + 1);
const publicRoutes = ['auth_login', 'auth_register', 'auth_refresh', 'categories_v1_api'];

const lines = routesBlock.split('\n');
let insideRoute = false;
let currentRoute = '';
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.match(/^\s+[a-zA-Z0-9_]+\s*=\s*\{\s*$/)) {
    insideRoute = true;
    currentRoute = line.trim().split('=')[0].trim();
  } else if (insideRoute && (line.match(/^\s*\}\s*$/) || line.match(/^\s*\},?\s*$/))) {
    if (currentRoute) {
      if (!publicRoutes.includes(currentRoute)) {
        if (!lines[i-1].includes('authorization_type')) {
          lines.splice(i, 0, '      authorization_type = "JWT"');
          i++; 
        }
      } else {
        if (lines[i-1].includes('authorization_type')) {
          lines.splice(i-1, 1);
          i--;
        }
      }
    }
    insideRoute = false;
    currentRoute = ''; // Reset currentRoute so we don't accidentally match the last }
  }
}

content = content.substring(0, startIdx) + lines.join('\n') + content.substring(endIdx + 1);
fs.writeFileSync(file, content);
console.log('Fixed JWT auth on all routes properly');
