import fs from 'fs';

const bundlePath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\index-CUcAChYr.js';

const content = fs.readFileSync(bundlePath, 'utf8');

console.log('--- INSPECTING OFFSET 64100 - 64400 ---');
console.log(content.slice(64000, 64500));
