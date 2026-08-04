const fs = require('fs');
let code = fs.readFileSync('terraform/environments/dev/locals.tf', 'utf8');

const regex = / {4}products = merge\(local\.dynamodb_table_defaults, {[\s\S]*?}\)/;
const replacement = `    products = merge(local.dynamodb_table_defaults, {
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

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('terraform/environments/dev/locals.tf', code);
    console.log('Successfully patched products table');
} else {
    console.log('Could not find match');
}
