import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-BnosZ_3-.js';

let content = fs.readFileSync(linkPath, 'utf8');

content = content.replace(
  'function ne(){throw Error(`Invariant failed`)}',
  'function ne(){ console.error("INVARIANT DEF TRIGGERED", new Error().stack); throw Error(`Invariant failed`); }'
);

fs.writeFileSync(linkPath, content);
console.log('Patched ne() definition in link bundle successfully!');
