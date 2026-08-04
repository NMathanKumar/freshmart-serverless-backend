import sys
import re

with open('terraform/environments/dev/locals.tf', 'r') as f:
    code = f.read()

pattern = re.compile(r'    products = merge\(local\.dynamodb_table_defaults, \{.*?    \}\)', re.DOTALL)

replacement = """    products = merge(local.dynamodb_table_defaults, {
      table_name    = "${var.project_name}-${local.environment_name}-products"
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
    })"""

if pattern.search(code):
    new_code = pattern.sub(replacement, code, count=1)
    with open('terraform/environments/dev/locals.tf', 'w') as f:
        f.write(new_code)
    print('Successfully patched products table')
else:
    print('Could not find match')
