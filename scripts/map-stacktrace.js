import fs from 'fs';
import path from 'path';

const bundlePath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\index-Dfld1Tdb.js';

const content = fs.readFileSync(bundlePath, 'utf8');

console.log('Total bundle length:', content.length);

// Search around offset 29719
const start = Math.max(0, 29719 - 300);
const end = Math.min(content.length, 29719 + 300);

console.log('Snippet around 29719:');
console.log(content.slice(start, end));
