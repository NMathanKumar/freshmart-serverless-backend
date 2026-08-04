import fs from 'fs';

const bundlePath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\index-CUcAChYr.js';

const content = fs.readFileSync(bundlePath, 'utf8');

console.log('--- INSPECTING OFFSET 29700 ---');
console.log(content.slice(Math.max(0, 29700 - 200), Math.min(content.length, 29700 + 200)));

console.log('--- INSPECTING OFFSET 64212 ---');
console.log(content.slice(Math.max(0, 64212 - 200), Math.min(content.length, 64212 + 200)));
