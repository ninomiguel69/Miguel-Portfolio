import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
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

const rawPath = path.join(__dirname, 'test_flood.raw');
const buffer = fs.readFileSync(rawPath);
const width = 160;
const height = 220;

const outBuf = Buffer.from(buffer);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = buffer[idx];
    const g = buffer[idx + 1];
    const b = buffer[idx + 2];

    const { h, s, l } = rgbToHsl(r, g, b);

    // Green grass: Hue 65 to 165, Saturation > 0.15
    const isGrass = (h >= 62 && h <= 170 && s > 0.15 && l > 0.15 && l < 0.85);

    // Background fence / top background
    const isTopBg = (y < 42 && (x < 55 || x > 105));
    const isTopLeftFence = (x < 35 && y < 110 && (isGrass || (r < 70 && g < 75 && b < 80)));
    const isTopRightWall = (x > 115 && y < 110 && (isGrass || r > 160 && g > 150 && b > 140));

    // Yellow shirt protection: Yellow shirt is Hue 45 to 60, high luminance (l > 0.5)
    const isShirt = (h >= 45 && h <= 60 && l > 0.45 && s > 0.4);

    if ((isGrass || isTopBg || isTopLeftFence || isTopRightWall) && !isShirt) {
      outBuf[idx + 3] = 0; // Transparent
    }
  }
}

const outRaw = path.join(__dirname, 'test_hsl.raw');
fs.writeFileSync(outRaw, outBuf);

const outPng = path.join(__dirname, 'test_hsl.png');
execFileSync(ffmpegStatic, [
  '-y',
  '-f', 'rawvideo',
  '-pixel_format', 'rgba',
  '-video_size', `${width}x${height}`,
  '-i', outRaw,
  outPng
]);

console.log('Saved test_hsl.png');
