const fs = require('fs');

const css = fs.readFileSync('style.css', 'utf8');
const lines = css.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes(':hover') && !line.startsWith('/*')) {
    // grab block
    let block = '';
    for (let j = i; j < Math.min(lines.length, i + 15); j++) {
      block += lines[j] + '\n';
      if (lines[j].includes('}')) break;
    }
    if (block.includes('transform') || block.includes('scale') || block.includes('translate') || block.includes('box-shadow')) {
      if (!block.includes('z-index')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
      }
    }
  }
}
