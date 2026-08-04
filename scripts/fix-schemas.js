const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../terraform/environments/dev/locals.tf');
let content = fs.readFileSync(file, 'utf8');

const productsSearch = `    products = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-products"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })`;
const productsReplace = `    products = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-products"
      partition_key = "PK"
      sort_key      = "SK"
      global_secondary_indexes = [
        {
          name            = "CategoryIndex"
          partition_key   = "CategoryPK"
          sort_key        = "CategorySK"
          projection_type = "ALL"
        },
        {
          name            = "AvailabilityIndex"
          partition_key   = "AvailabilityPK"
          sort_key        = "AvailabilitySK"
          projection_type = "ALL"
        },
      ]
    })`;

const inventorySearch = `    inventory = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-inventory"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })`;
const inventoryReplace = `    inventory = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-inventory"
      partition_key = "productId"
      global_secondary_indexes = [
        {
          name            = "warehouse-index"
          partition_key   = "warehouseId"
          projection_type = "ALL"
        },
        {
          name            = "stockStatus-index"
          partition_key   = "stockStatus"
          projection_type = "ALL"
        },
      ]
    })`;

const cartsSearch = `    carts = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-carts"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsiCart"
          partition_key   = "gsiCartPk"
          sort_key        = "gsiCartSk"
          projection_type = "ALL"
        },
        {
          name            = "gsiProduct"
          partition_key   = "gsiProductPk"
          sort_key        = "gsiProductSk"
          projection_type = "ALL"
        },
      ]
    })`;
const cartsReplace = `    carts = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-carts"
      partition_key = "userId"
      sort_key      = "productId"
    })`;

const ordersSearch = `    orders = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-orders"
      partition_key = "pk"
      sort_key      = "sk"
      global_secondary_indexes = [
        {
          name            = "gsi1"
          partition_key   = "gsi1pk"
          sort_key        = "gsi1sk"
          projection_type = "ALL"
        },
        {
          name            = "gsi2"
          partition_key   = "gsi2pk"
          sort_key        = "gsi2sk"
          projection_type = "ALL"
        },
      ]
    })`;
const ordersReplace = `    orders = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-orders"
      partition_key = "orderId"
      global_secondary_indexes = [
        {
          name            = "customer-index"
          partition_key   = "customerId"
          projection_type = "ALL"
        },
        {
          name            = "status-index"
          partition_key   = "status"
          projection_type = "ALL"
        },
        {
          name            = "createdDate-index"
          partition_key   = "createdDate"
          projection_type = "ALL"
        },
      ]
    })`;

const userProfilesSearch = `    user_profiles = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-user-profiles"
      partition_key = "pk"
      sort_key      = "sk"
    })`;
const userProfilesReplace = ``; // REMOVE THIS IF IT'S IN THE DIFF! Wait, earlier diff removed user_profiles! Let's check!

content = content.replace(productsSearch, productsReplace);
content = content.replace(inventorySearch, inventoryReplace);
content = content.replace(cartsSearch, cartsReplace);
content = content.replace(ordersSearch, ordersReplace);

// Remove user_profiles table entirely if needed
if (content.includes(userProfilesSearch)) {
  content = content.replace(userProfilesSearch, '');
  // Also remove user_profiles from admin table permissions!
  content = content.replace(/module\.dynamodb\["user_profiles"\]\.table_arn,\n\s*"\${module\.dynamodb\["user_profiles"\]\.table_arn}\/index\/\*",/g, '');
  content = content.replace(/DDB_TABLE_USER_PROFILES = module\.dynamodb\["user_profiles"\]\.table_name/g, '');
}

fs.writeFileSync(file, content);
console.log('Fixed DynamoDB schemas in locals.tf');
