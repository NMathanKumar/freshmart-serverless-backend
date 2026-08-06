const fs = require('fs');
const path = 'terraform/environments/dev/locals.tf';
let content = fs.readFileSync(path, 'utf8');

const regex = /dynamodb_table_permissions\s*=\s*\[([\s\S]*?)\]/g;
content = content.replace(regex, (match, p1) => {
  if (p1.includes('freshmart-iam')) return match;
  return `dynamodb_table_permissions = [\n          {\n            table_arn = module.dynamodb["freshmart-iam"].table_arn\n            actions   = local.iam_dynamodb_ro_actions\n          },${p1}]`;
});

content = content.replace(
  /payments\s*=\s*merge\(local\.dynamodb_table_defaults,\s*\{\s*table_name\s*=\s*"\$\{var\.project_name\}-\$\{local\.environment_name\}-payments"\s*partition_key\s*=\s*"paymentId"\s*global_secondary_indexes\s*=\s*\[\s*\{\s*name\s*=\s*"order-index"\s*partition_key\s*=\s*"orderId"\s*projection_type\s*=\s*"ALL"\s*\}\s*,\s*\{\s*name\s*=\s*"status-index"\s*partition_key\s*=\s*"status"\s*projection_type\s*=\s*"ALL"\s*\}\s*,\s*\]\s*\}\)/,
  `payments = merge(local.dynamodb_table_defaults, {
      table_name    = "\${var.project_name}-\${local.environment_name}-payments"
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
    })`
);

fs.writeFileSync(path, content);
console.log('locals.tf updated successfully');
