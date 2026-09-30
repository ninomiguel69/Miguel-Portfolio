import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');
const framesDir = path.join(__dirname, 'dance_frames');

if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

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

const numFrames = 28;
const fps = 14;
const startTime = 2.1;
const width = 150;
const height = 205;

console.log(`Extracting and keying ${numFrames} frames with generous headroom...`);

for (let i = 0; i < numFrames; i++) {
  const t = (startTime + (i / fps)).toFixed(3);
  const rawFile = path.join(framesDir, `raw_${i}.raw`);
  
  // Extract cropped frame scaled to 150x205 with y=40 for full headroom!
  execFileSync(ffmpegStatic, [
    '-y',
    '-ss', `${t}`,
    '-i', videoPath,
    '-vf', 'crop=360:490:265:40,scale=150:205',
    '-vframes', '1',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    rawFile
  ]);

  const buf = fs.readFileSync(rawFile);
  const outBuf = Buffer.from(buf);

  // Process alpha channel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = buf[idx];
      const g = buf[idx + 1];
      const b = buf[idx + 2];

      const { h, s, l } = rgbToHsl(r, g, b);

      // Core protection zones for user's body
      const inHeadCore = (y >= 12 && y <= 55 && x >= 52 && x <= 98);
      const inTorsoCore = (y >= 50 && y <= 118 && x >= 42 && x <= 108);

      // Background candidates
      // Grass: hue between 62 and 170, green dominance
      const isGrass = (h >= 62 && h <= 170 && s > 0.15 && l > 0.14 && l < 0.88);
      // Top rocks/background outside head
      const isTopBg = (y < 45 && (x < 48 || x > 102));
      // Outer border edges
      const isOuterEdge = (x < 18 || x > 132 || y < 10);
      const isSideBg = (y < 105 && (x < 32 || x > 118));

      if (!inTorsoCore && !inHeadCore) {
        if (isGrass || isTopBg || isOuterEdge || isSideBg) {
          outBuf[idx + 3] = 0; // Transparent
        }
      }
    }
  }

  // Save keyed png
  const pngFile = path.join(framesDir, `frame_${String(i).padStart(3, '0')}.png`);
  fs.writeFileSync(rawFile, outBuf);
  execFileSync(ffmpegStatic, [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgba',
    '-video_size', `${width}x${height}`,
    '-i', rawFile,
    pngFile
  ]);
  fs.unlinkSync(rawFile);
}

// Assemble into animated webp
const webpOut = path.join(__dirname, '../assets/miguel-dancer.webp');
console.log('Assembling updated animated webp...');

execFileSync(ffmpegStatic, [
  '-y',
  '-framerate', `${fps}`,
  '-i', path.join(framesDir, 'frame_%03d.png'),
  '-vcodec', 'libwebp',
  '-lossless', '0',
  '-q:v', '85',
  '-loop', '0',
  '-pix_fmt', 'yuva420p',
  webpOut
]);

const stats = fs.statSync(webpOut);
console.log('Successfully created animated webp at:', webpOut, 'size:', stats.size, 'bytes');
