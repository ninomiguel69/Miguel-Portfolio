import fs from 'fs';
import { execSync } from 'child_process';
import http from 'http';

console.log('=== 1. JAVASCRIPT SYNTAX CHECK ===');
execSync('node --check main.js', { stdio: 'inherit' });
execSync('node --check server.js', { stdio: 'inherit' });
console.log('PASS: main.js and server.js have valid syntax.');

console.log('=== 2. CSS BRACE VALIDATION ===');
const css = fs.readFileSync('style.css', 'utf-8');
let depth = 0;
let inComment = false;
let inString = null;
let maxDepth = 0;
let errors = [];

for (let i = 0; i < css.length; i++) {
  const c = css[i];
  const next = css[i + 1];

  if (inComment) {
    if (c === '*' && next === '/') {
      inComment = false;
      i++;
    }
    continue;
  }

  if (inString) {
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === inString) {
      inString = null;
    }
    continue;
  }

  if (c === '/' && next === '*') {
    inComment = true;
    i++;
    continue;
  }

  if (c === '"' || c === "'") {
    inString = c;
    continue;
  }

  if (c === '{') {
    depth++;
    if (depth > maxDepth) maxDepth = depth;
  } else if (c === '}') {
    depth--;
    if (depth < 0) {
      errors.push(`Extra closing brace near char index ${i}`);
    }
  }
}

if (depth !== 0) {
  errors.push(`Unbalanced braces: final depth is ${depth}`);
}

console.log(`CSS Max Depth: ${maxDepth}, Final Depth: ${depth}, Errors: ${errors.length}`);
if (errors.length > 0) {
  console.error(errors);
  process.exit(1);
} else {
  console.log('PASS: style.css has perfectly balanced braces.');
}

console.log('=== 3. HTML INTEGRITY CHECK ===');
const html = fs.readFileSync('index.html', 'utf-8');
const tags = ['html', 'head', 'body'];
for (const tag of tags) {
  const openCount = (html.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>', 'gi')) || []).length;
  const closeCount = (html.match(new RegExp('</' + tag + '\\s*>', 'gi')) || []).length;
  console.log(`${tag} tag counts: open=${openCount}, close=${closeCount}`);
  if (openCount !== 1 || closeCount !== 1) {
    console.error(`FAIL: Mismatch for tag <${tag}>`);
    process.exit(1);
  }
}
console.log('PASS: index.html root structure is valid.');

console.log('=== 4. HTTP SERVER SMOKE TEST (PORT 3000) ===');
function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`GET ${path} -> Status: ${res.statusCode}, Length: ${data.length}`);
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Non-200 status ${res.statusCode} for ${path}`));
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    await testEndpoint('/');
    await testEndpoint('/style.css');
    await testEndpoint('/main.js');
    console.log('PASS: All core endpoints returning 200 OK.');
    console.log('=== ALL VALIDATION CHECKS PASSED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Server smoke test failed:', err);
    process.exit(1);
  }
})();
