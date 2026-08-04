const fs = require('fs');

const localsPath = 'terraform/environments/dev/locals.tf';
let content = fs.readFileSync(localsPath, 'utf8');

// 1. Add admin_table_permissions
const iam_dynamodb_ro_actions_idx = content.indexOf('  iam_dynamodb_ro_actions = [');
if (iam_dynamodb_ro_actions_idx !== -1 && !content.includes('admin_table_permissions')) {
  const adminPermissionsStr = `  admin_table_permissions = {
    admin = {
      actions = [
        "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"
      ]
      resources = [
        module.dynamodb["admin"].table_arn,
        "\${module.dynamodb["admin"].table_arn}/index/*",
        module.dynamodb["products"].table_arn,
        "\${module.dynamodb["products"].table_arn}/index/*",
        module.dynamodb["inventory"].table_arn,
        "\${module.dynamodb["inventory"].table_arn}/index/*",
        module.dynamodb["orders"].table_arn,
        "\${module.dynamodb["orders"].table_arn}/index/*",
        module.dynamodb["user_profiles"].table_arn,
        "\${module.dynamodb["user_profiles"].table_arn}/index/*"
      ]
    }
  }

`;
  content = content.slice(0, iam_dynamodb_ro_actions_idx) + adminPermissionsStr + content.slice(iam_dynamodb_ro_actions_idx);
}

// 2. Add DDB tables to admin service
const adminServiceDDBIdx = content.indexOf('        DDB_TABLE_ADMIN    = module.dynamodb["admin"].table_name');
if (adminServiceDDBIdx !== -1 && !content.includes('DDB_TABLE_PRODUCTS')) {
  const replacement = `        DDB_TABLE_ADMIN        = module.dynamodb["admin"].table_name
        DDB_TABLE_PRODUCTS     = module.dynamodb["products"].table_name
        DDB_TABLE_INVENTORY    = module.dynamodb["inventory"].table_name
        DDB_TABLE_ORDERS       = module.dynamodb["orders"].table_name
        DDB_TABLE_USER_PROFILES = module.dynamodb["user_profiles"].table_name`;
  content = content.replace('        DDB_TABLE_ADMIN    = module.dynamodb["admin"].table_name', replacement);
}

// 3. Add authorization_type = "JWT" to endpoints (except public ones)
const publicEndpoints = ['products_list', 'products_get', 'menu_search', 'menu_list', 'menu_get'];
const endpointRegex = /([a-z_]+)\s*=\s*{\s*method\s*=\s*"[^"]+"\s*path\s*=\s*"[^"]+"\s*lambda_key\s*=\s*"[^"]+"\s*}/g;

content = content.replace(endpointRegex, (match, endpointName) => {
  if (publicEndpoints.includes(endpointName)) {
    return match; // keep as is
  }
  return match.replace(/}\s*$/, '  authorization_type = "JWT"\n    }');
});

fs.writeFileSync(localsPath, content);
console.log('locals.tf patched successfully!');
