const fs = require('fs');
const path = 'terraform/environments/dev/locals.tf';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/module\.dynamodb\["freshmart-iam"\]/g, 'module.dynamodb["admin"]');

fs.writeFileSync(path, content);
console.log('locals.tf updated successfully with admin table');
