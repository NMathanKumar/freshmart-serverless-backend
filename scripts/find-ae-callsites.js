import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-CIWMd2VX.js';

const content = fs.readFileSync(linkPath, 'utf8');

const regex = /ae\(\)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Callsite at offset ${match.index}:`);
  console.log(content.slice(Math.max(0, match.index - 100), Math.min(content.length, match.index + 100)));
  console.log('---');
}
