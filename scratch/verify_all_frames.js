import fs from 'fs';

let missing = 0;
let zeroSize = 0;
let minSize = Infinity;
let maxSize = 0;

for (let i = 1; i <= 300; i++) {
  const padded = String(i).padStart(3, '0');
  const path = `frames/frame-${padded}.webp`;
  if (!fs.existsSync(path)) {
    missing++;
    console.log(`Missing: ${path}`);
  } else {
    const sz = fs.statSync(path).size;
    if (sz === 0) zeroSize++;
    if (sz < minSize) minSize = sz;
    if (sz > maxSize) maxSize = sz;
  }
}

console.log(`Missing: ${missing}, ZeroSize: ${zeroSize}, Min: ${minSize}, Max: ${maxSize}`);
