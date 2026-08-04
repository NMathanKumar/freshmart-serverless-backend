const fs = require('fs');
let code = fs.readFileSync('terraform/environments/dev/locals.tf', 'utf8');

const oldProducts = `    products = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-products"
      partition_key = "productId"
      global_secondary_indexes = [
        {
          name            = "category-index"
          partition_key   = "category"
          projection_type = "ALL"
        },
        {
          name            = "brand-index"
          partition_key   = "brand"
          projection_type = "ALL"
        },
        {
          name            = "status-index"
          partition_key   = "status"
          projection_type = "ALL"
        },
      ]
    })`;

const newProducts = `    products = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-products"
      partition_key = "PK"
      sort_key      = "SK"
      global_secondary_indexes = [
        {
          name            = "CategoryIndex"
          partition_key   = "Categorypk"
          sort_key        = "Categorysk"
          projection_type = "ALL"
        },
        {
          name            = "AvailabilityIndex"
          partition_key   = "Availabilitypk"
          sort_key        = "Availabilitysk"
          projection_type = "ALL"
        },
      ]
    })`;

if (code.includes(oldProducts)) {
    code = code.replace(oldProducts, newProducts);
    fs.writeFileSync('terraform/environments/dev/locals.tf', code);
    console.log('Successfully patched products table');
} else {
    console.log('Could not find match');
}
