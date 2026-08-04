const fs = require('fs');
let code = fs.readFileSync('terraform/environments/dev/locals.tf', 'utf8');

const regex = / {4}inventory = merge\(local\.dynamodb_table_defaults, {[\s\S]*?}\)/;
const replacement = `    inventory = merge(local.dynamodb_table_defaults, {
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

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('terraform/environments/dev/locals.tf', code);
    console.log('Successfully patched inventory table');
} else {
    console.log('Could not find match');
}
