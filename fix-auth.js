const fs = require('fs');
let f = fs.readFileSync('scripts/seed-database.js', 'utf8');

// The auth users uses PK and SK
f = f.replace(/else if \(tableName === TABLES\.auth\) Key = \{ pk: item\.pk, sk: item\.sk \};/, 'else if (tableName === TABLES.auth) Key = { PK: item.PK, SK: item.SK };');

// Let's replace the properties for authUserItems.push({
f = f.replace(/pk: `USER/g, 'PK: `USER');
f = f.replace(/sk: `PROFILE/g, 'SK: `PROFILE');
f = f.replace(/pk: `EMAIL/g, 'PK: `EMAIL');
f = f.replace(/sk: `USER/g, 'SK: `USER');

fs.writeFileSync('scripts/seed-database.js', f);
console.log('Fixed auth keys');
