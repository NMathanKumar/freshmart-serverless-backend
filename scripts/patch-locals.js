const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '../terraform/environments/dev/locals.tf');
let content = fs.readFileSync(file, 'utf8');

// 1. Update admin inline_policies to include other tables
const adminPolicySearch = `        admin = {
      actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"]
      resources = [module.dynamodb["admin"].table_arn, "\${module.dynamodb["admin"].table_arn}/index/*"]
    }`;
const adminPolicyReplace = `        admin = {
      actions   = ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan"]
      resources = [
        module.dynamodb["admin"].table_arn, "\${module.dynamodb["admin"].table_arn}/index/*",
        module.dynamodb["products"].table_arn, "\${module.dynamodb["products"].table_arn}/index/*",
        module.dynamodb["inventory"].table_arn, "\${module.dynamodb["inventory"].table_arn}/index/*",
        module.dynamodb["orders"].table_arn, "\${module.dynamodb["orders"].table_arn}/index/*",
        module.dynamodb["user_profiles"].table_arn, "\${module.dynamodb["user_profiles"].table_arn}/index/*"
      ]
    }`;
content = content.replace(adminPolicySearch, adminPolicyReplace);

// 2. Add ENV vars to admin service
const adminEnvSearch = `        DDB_TABLE_ADMIN    = module.dynamodb["admin"].table_name`;
const adminEnvReplace = `        DDB_TABLE_ADMIN    = module.dynamodb["admin"].table_name
        DDB_TABLE_PRODUCTS     = module.dynamodb["products"].table_name
        DDB_TABLE_INVENTORY    = module.dynamodb["inventory"].table_name
        DDB_TABLE_ORDERS       = module.dynamodb["orders"].table_name
        DDB_TABLE_USER_PROFILES = module.dynamodb["user_profiles"].table_name`;
content = content.replace(adminEnvSearch, adminEnvReplace);

// 3. Append missing API Gateway routes
const apiRoutesSearch = `    admin_audit = {
      method     = "GET"
      path       = "/admin/audit"
      lambda_key = "admin"
      authorization_type = "JWT"
    }
  }`;

const missingRoutes = `
    cart_v1_get = { method = "GET", path = "/v1/cart", lambda_key = "cart", authorization_type = "JWT" }
    cart_v1_post = { method = "POST", path = "/v1/cart", lambda_key = "cart", authorization_type = "JWT" }
    cart_v1_patch = { method = "PATCH", path = "/v1/cart/{productId}", lambda_key = "cart", authorization_type = "JWT" }
    cart_v1_delete = { method = "DELETE", path = "/v1/cart/{productId}", lambda_key = "cart", authorization_type = "JWT" }
    wishlist_v1_get = { method = "GET", path = "/api/v1/customer/wishlist", lambda_key = "user", authorization_type = "JWT" }
    categories_v1_get = { method = "GET", path = "/api/v1/customer/categories", lambda_key = "admin", authorization_type = "JWT" }
    categories_v1_api = { method = "GET", path = "/api/v1/categories", lambda_key = "admin", authorization_type = "NONE" }
    user_profile_v1_get = { method = "GET", path = "/api/v1/customer/profile", lambda_key = "user", authorization_type = "JWT" }
    user_addresses_v1_post = { method = "POST", path = "/v1/users/addresses", lambda_key = "user", authorization_type = "JWT" }
    order_v1_get = { method = "GET", path = "/v1/orders", lambda_key = "order", authorization_type = "JWT" }
    order_v1_post = { method = "POST", path = "/v1/orders", lambda_key = "order", authorization_type = "JWT" }
    
    admin_dashboard_v1 = { method = "GET", path = "/v1/admin/dashboard", lambda_key = "admin", authorization_type = "JWT" }
    admin_categories_list = { method = "ANY", path = "/v1/admin/categories", lambda_key = "admin", authorization_type = "JWT" }
    admin_categories_id = { method = "ANY", path = "/v1/admin/categories/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_coupons_list = { method = "ANY", path = "/v1/admin/coupons", lambda_key = "admin", authorization_type = "JWT" }
    admin_coupons_id = { method = "ANY", path = "/v1/admin/coupons/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_reviews_list = { method = "ANY", path = "/v1/admin/reviews", lambda_key = "admin", authorization_type = "JWT" }
    admin_reviews_id = { method = "ANY", path = "/v1/admin/reviews/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_suppliers_list = { method = "ANY", path = "/v1/admin/suppliers", lambda_key = "admin", authorization_type = "JWT" }
    admin_suppliers_id = { method = "ANY", path = "/v1/admin/suppliers/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_purchase_orders_list = { method = "ANY", path = "/v1/admin/purchase-orders", lambda_key = "admin", authorization_type = "JWT" }
    admin_purchase_orders_id = { method = "ANY", path = "/v1/admin/purchase-orders/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_deliveries_list = { method = "ANY", path = "/v1/admin/deliveries", lambda_key = "admin", authorization_type = "JWT" }
    admin_deliveries_id = { method = "ANY", path = "/v1/admin/deliveries/{proxy+}", lambda_key = "admin", authorization_type = "JWT" }
    admin_customers_list = { method = "ANY", path = "/v1/admin/customers", lambda_key = "user", authorization_type = "JWT" }
    admin_customers_id = { method = "ANY", path = "/v1/admin/customers/{proxy+}", lambda_key = "user", authorization_type = "JWT" }
    admin_orders_v1 = { method = "ANY", path = "/v1/admin/orders", lambda_key = "order", authorization_type = "JWT" }
    admin_orders_id_v1 = { method = "ANY", path = "/v1/admin/orders/{proxy+}", lambda_key = "order", authorization_type = "JWT" }`;

content = content.replace(apiRoutesSearch, apiRoutesSearch.replace('  }', missingRoutes + '\n  }'));

fs.writeFileSync(file, content);
console.log('patched locals.tf successfully');
