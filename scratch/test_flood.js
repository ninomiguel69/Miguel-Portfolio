import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Convert dance_1_2.50s.png to raw RGBA
const rawPath = path.join(__dirname, 'test_flood.raw');
execFileSync(ffmpegStatic, [
  '-y',
  '-i', path.join(__dirname, 'dance_1_2.50s.png'),
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  rawPath
]);

const buffer = fs.readFileSync(rawPath);
const width = 160;
const height = 220;

// Algorithm:
// 1. Mark background candidates:
//    - Grass: (g > r * 0.98 && g > b * 1.18 && g > 75 && !(r > 160 && g > 160 && b < 100)) // not yellow shirt!
//    - Dark background at top: (y < 45 && (x < 45 || x > 115))
// 2. Perform a flood-fill from all 4 borders (x=0, x=width-1, y=0, y=height-1)
//    Only pixels reachable from the borders that match background candidate get marked as transparent!
//    This guarantees NO holes inside the body or yellow shirt!

const isBgCandidate = new Uint8Array(width * height);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = buffer[idx];
    const g = buffer[idx + 1];
    const b = buffer[idx + 2];

    const isYellowShirt = (r > 155 && g > 155 && b < 130 && r > b * 1.5);
    const isSkin = (r > 140 && g > 90 && b > 70 && r > g && g > b);
    const isPants = (y > 90 && r < 100 && g < 110 && b < 130 && Math.abs(r - g) < 30);
    const isShoes = (y > 175 && r > 160 && g > 160 && b > 150);

    const isPerson = isYellowShirt || isSkin || isPants || isShoes;

    // Grass
    const isGrass = (g > r * 0.95 && g > b * 1.15 && g > 70 && !isYellowShirt && !isSkin);
    // Background fence/shrubs
    const isTopBg = (y < 40 && (x < 50 || x > 110));

    if (!isPerson && (isGrass || isTopBg)) {
      isBgCandidate[y * width + x] = 1;
    }
  }
}

// Flood fill from borders
const visited = new Uint8Array(width * height);
const queue = [];

function push(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const p = y * width + x;
  if (!visited[p] && isBgCandidate[p]) {
    visited[p] = 1;
    queue.push(p);
  }
}

// Add all 4 borders
for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
}

while (queue.length > 0) {
  const p = queue.shift();
  const x = p % width;
  const y = Math.floor(p / width);

  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

// Clear visited background pixels
const outBuf = Buffer.from(buffer);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = y * width + x;
    const idx = p * 4;
    if (visited[p]) {
      outBuf[idx + 3] = 0; // Transparent!
    } else {
      // Soft edge cleanup
    }
  }
}

const outRaw = path.join(__dirname, 'test_flood.raw');
fs.writeFileSync(outRaw, outBuf);

const outPng = path.join(__dirname, 'test_flood.png');
execFileSync(ffmpegStatic, [
  '-y',
  '-f', 'rawvideo',
  '-pixel_format', 'rgba',
  '-video_size', `${width}x${height}`,
  '-i', outRaw,
  outPng
]);

console.log('Saved test_flood.png');
