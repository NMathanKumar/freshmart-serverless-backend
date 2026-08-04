import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-BnosZ_3-.js';

const content = fs.readFileSync(linkPath, 'utf8');

const regex = /\bne\(/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Callsite at offset ${match.index}:`);
  console.log(content.slice(Math.max(0, match.index - 80), Math.min(content.length, match.index + 80)));
  console.log('---');
}
