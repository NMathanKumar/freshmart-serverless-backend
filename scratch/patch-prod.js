const fs = require('fs');

const prodLocalsFile = 'terraform/environments/prod/locals.tf';
let locals = fs.readFileSync(prodLocalsFile, 'utf8');

// 1. Remove subnet_ids and security_group_ids
locals = locals.replace(/\s+subnet_ids\s+=\s+module\.network\.private_subnet_ids\s+security_group_ids\s+=\s+\[module\.network\.lambda_security_group_id\]/, '');

// 2. Set publish = false
locals = locals.replace(/publish\s+=\s+true/, 'publish                        = false');

// 3. Remove authorization_type = "JWT" from auth routes
locals = locals.replace(/auth_register = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/register"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_register = {\n      method     = "POST"\n      path       = "/auth/register"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_login = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/login"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_login = {\n      method     = "POST"\n      path       = "/auth/login"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_refresh = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/refresh"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_refresh = {\n      method     = "POST"\n      path       = "/auth/refresh"\n      lambda_key = "auth"\n    }');
locals = locals.replace(/auth_logout = \{\s+method\s+=\s+"POST"\s+path\s+=\s+"\/auth\/logout"\s+lambda_key\s+=\s+"auth"\s+authorization_type\s+=\s+"JWT"\s+\}/, 'auth_logout = {\n      method     = "POST"\n      path       = "/auth/logout"\n      lambda_key = "auth"\n    }');

fs.writeFileSync(prodLocalsFile, locals);

console.log("Patched PROD successfully!");
