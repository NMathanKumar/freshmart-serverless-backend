const fs = require('fs');
let f = fs.readFileSync('scripts/seed-database.js', 'utf8');

// For the products table, we need PK and SK
f = f.replace(/else if \(tableName === TABLES\.products\) Key = \{ pk: item\.pk, sk: item\.sk \};/, 'else if (tableName === TABLES.products) Key = { PK: item.PK, SK: item.SK };');

// For product items insertion, change pk and sk to PK and SK
f = f.replace(/pk: `PRODUCT#\$\{p\.id\}`/g, 'PK: `PRODUCT#${p.id}`');
f = f.replace(/sk: 'META'/g, "SK: 'META'");
f = f.replace(/sk: 'LIST'/g, "SK: 'LIST'");

fs.writeFileSync('scripts/seed-database.js', f);
console.log('Fixed keys');
