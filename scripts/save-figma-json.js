#!/usr/bin/env node
/**
 * This script reads the Figma tokens from the user's message and saves them.
 * Since the JSON is too large for a single file write, we process it here.
 * 
 * The actual JSON content needs to be piped in:
 *   cat figma-tokens-raw.json | node scripts/save-figma-json.js
 * 
 * Or just copy the JSON to docs/tokens-figma-structure.json manually.
 */
const fs = require('fs');

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  try {
    const json = JSON.parse(data);
    fs.writeFileSync('docs/tokens-figma-structure.json', JSON.stringify(json, null, 2));
    console.log('Saved', Object.keys(json).length, 'top-level keys');
    
    // Count tokens recursively
    let count = 0;
    function walk(obj) {
      for (const k of Object.keys(obj)) {
        if (obj[k] && typeof obj[k] === 'object') {
          if (obj[k].$type !== undefined) count++;
          else walk(obj[k]);
        }
      }
    }
    walk(json);
    console.log('Total tokens:', count);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }
});
