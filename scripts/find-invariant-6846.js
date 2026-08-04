import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-BnosZ_3-.js';

const content = fs.readFileSync(linkPath, 'utf8');

console.log('Total length of link-BnosZ_3-.js:', content.length);

const start = Math.max(0, 6846 - 300);
const end = Math.min(content.length, 6846 + 300);

console.log('Snippet in link.js around 6846:');
console.log(content.slice(start, end));
