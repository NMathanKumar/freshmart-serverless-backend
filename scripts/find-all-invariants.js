import fs from 'fs';
import path from 'path';

const assetsDir = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets';

const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const matches = [...content.matchAll(/Invariant failed/g)];
  if (matches.length > 0) {
    console.log(`File ${file} has ${matches.length} matches of "Invariant failed":`);
    matches.forEach(m => {
      console.log(`  Offset ${m.index}:`);
      console.log('  ', content.slice(Math.max(0, m.index - 100), Math.min(content.length, m.index + 100)));
    });
  }
});
