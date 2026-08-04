import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-CIWMd2VX.js';

const content = fs.readFileSync(linkPath, 'utf8');

console.log('Total link file length:', content.length);

const start = Math.max(0, 7002 - 300);
const end = Math.min(content.length, 7002 + 300);

console.log('Snippet in link.js around 7002:');
console.log(content.slice(start, end));
