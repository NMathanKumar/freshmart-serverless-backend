const fs = require('fs');
const f = 'terraform/environments/dev/locals.tf';
let content = fs.readFileSync(f, 'utf8');

// Patch auth_register
content = content.replace(
  /auth_register = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/register"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/,
  'auth_register = {\n      method     = "POST"\n      path       = "/auth/register"\n      lambda_key = "auth"\n    }'
);

// Patch auth_login
content = content.replace(
  /auth_login = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/login"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/,
  'auth_login = {\n      method     = "POST"\n      path       = "/auth/login"\n      lambda_key = "auth"\n    }'
);

// Patch auth_refresh
content = content.replace(
  /auth_refresh = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/refresh"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/,
  'auth_refresh = {\n      method     = "POST"\n      path       = "/auth/refresh"\n      lambda_key = "auth"\n    }'
);

fs.writeFileSync(f, content);
console.log('Fixed auth routes in locals.tf');
