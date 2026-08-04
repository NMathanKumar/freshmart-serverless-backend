import fs from 'fs';

const linkPath = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets\\link-BnosZ_3-.js';

let content = fs.readFileSync(linkPath, 'utf8');

content = content.replace(
  'e.id in a&&(console.error("EXACT DUPLICATE ROUTE ID TRIGGERING INVARIANT:", e.id, e),ne())',
  'console.log("[ROUTE ID CHECK]", e.id), (e.id in a && (console.error("[FOUND DUPLICATE ROUTE ID]", e.id, e), ne()))'
);

fs.writeFileSync(linkPath, content);
console.log('Patched link bundle with route ID logger!');
