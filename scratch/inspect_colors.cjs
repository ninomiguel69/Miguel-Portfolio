const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const rawPath = path.join(__dirname, 'inspect_pixel.raw');
execFileSync(ffmpeg, [
  '-y',
  '-i', path.join(__dirname, 'full_move_10_56.00s.jpg'),
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  rawPath
]);

const buf = fs.readFileSync(rawPath);
// image size is 240x390
const width = 240;
const height = 390;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

// Sample points:
// Grass (x=30, y=250), Grass (x=200, y=300), Grass (x=120, y=350)
// Yellow shirt (x=115, y=140), (x=130, y=150)
// Jeans (x=90, y=250), (x=140, y=280)
// Skin arm (x=105, y=70), face (x=105, y=80)
// Rock fountain (x=100, y=35)
// Top black wall (x=30, y=50)

const samplePoints = [
  { name: 'Grass left', x: 30, y: 250 },
  { name: 'Grass right', x: 210, y: 300 },
  { name: 'Grass center-bottom', x: 120, y: 360 },
  { name: 'Yellow shirt center', x: 120, y: 150 },
  { name: 'Yellow shirt bright', x: 135, y: 140 },
  { name: 'Jeans left leg', x: 80, y: 260 },
  { name: 'Jeans right leg', x: 135, y: 280 },
  { name: 'Skin arm', x: 110, y: 70 },
  { name: 'Skin face', x: 100, y: 80 },
  { name: 'Hair', x: 110, y: 55 },
  { name: 'Rock fountain top', x: 100, y: 35 },
  { name: 'White chair top', x: 210, y: 70 },
  { name: 'Black fence top left', x: 30, y: 50 },
];

for (const sp of samplePoints) {
  const idx = (sp.y * width + sp.x) * 4;
  const r = buf[idx];
  const g = buf[idx + 1];
  const b = buf[idx + 2];
  const hsl = rgbToHsl(r, g, b);
  console.log(`${sp.name.padEnd(22)}: RGB(${String(r).padStart(3)}, ${String(g).padStart(3)}, ${String(b).padStart(3)}) | HSL(${hsl.h.toFixed(1).padStart(5)}°, ${(hsl.s*100).toFixed(1).padStart(5)}%, ${(hsl.l*100).toFixed(1).padStart(5)}%)`);
}
