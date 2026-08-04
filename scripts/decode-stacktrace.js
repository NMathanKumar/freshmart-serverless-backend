import fs from 'fs';
import path from 'path';
import sourceMap from 'source-map-js';

const assetsDir = 'c:\\Users\\mathankumar.n\\Downloads\\projects\\freshmart-serverless-backend\\apps\\pixel-palette-project-21-main\\.output\\public\\assets';

function mapPosition(jsFilename, line, column) {
  const jsPath = path.join(assetsDir, jsFilename);
  const mapPath = jsPath + '.map';

  if (!fs.existsSync(mapPath)) {
    console.error(`Map file not found: ${mapPath}`);
    return;
  }

  const rawMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const consumer = new sourceMap.SourceMapConsumer(rawMap);

  const pos = consumer.originalPositionFor({ line, column });
  console.log(`--- MAPPING ${jsFilename}:${line}:${column} ---`);
  console.log(`Original Source: ${pos.source}`);
  console.log(`Original Line:   ${pos.line}`);
  console.log(`Original Column: ${pos.column}`);
  console.log(`Original Name:   ${pos.name}`);

  if (pos.source && rawMap.sourcesContent) {
    const sourceIndex = rawMap.sources.indexOf(pos.source);
    if (sourceIndex !== -1 && rawMap.sourcesContent[sourceIndex]) {
      const sourceLines = rawMap.sourcesContent[sourceIndex].split('\n');
      console.log('\n--- SOURCE CODE SNIPPET ---');
      const startLine = Math.max(0, pos.line - 5);
      const endLine = Math.min(sourceLines.length, pos.line + 5);
      for (let l = startLine; l < endLine; l++) {
        const prefix = l + 1 === pos.line ? '=> ' : '   ';
        console.log(`${prefix}${l + 1}: ${sourceLines[l]}`);
      }
    }
  }
}

console.log('=== DECODING FULL STACK TRACE FROM SOURCEMAPS ===\n');

// 1. Frame 1: ne in link-BnosZ_3-.js:1:6846
mapPosition('link-BnosZ_3-.js', 1, 6846);

console.log('\n==================================================\n');

// 2. Frame 2: Go in index-Cr-FpcTq.js:12:29700
mapPosition('index-Cr-FpcTq.js', 12, 29700);

console.log('\n==================================================\n');

// 3. Frame 3: Wc in index-Cr-FpcTq.js:12:64206
mapPosition('index-Cr-FpcTq.js', 12, 64206);
