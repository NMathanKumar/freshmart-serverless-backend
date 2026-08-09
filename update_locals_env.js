const fs = require('fs');
const path = 'terraform/environments/dev/locals.tf';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /lambda_common_environment\s*=\s*\{([^}]*)\}/,
  (match, p1) => {
    if (p1.includes('IAM_TABLE_NAME')) return match;
    return `lambda_common_environment = {${p1}  IAM_TABLE_NAME = module.dynamodb["admin"].table_name\n  }`;
  }
);

fs.writeFileSync(path, content);
console.log('locals.tf updated successfully with IAM_TABLE_NAME in lambda_common_environment');
