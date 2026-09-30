import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read test_crop.png
// Since PNG decoding without extra libraries can be done via raw RGBA from ffmpeg:
// Let's have ffmpeg export raw RGBA:
import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const rawOut = path.join(__dirname, 'test_crop.raw');
execFileSync(ffmpegStatic, [
  '-y',
  '-ss', '3.5',
  '-i', path.join(__dirname, '../Dancing Video.mp4'),
  '-vf', 'crop=330:440:290:80',
  '-vframes', '1',
  '-f', 'rawvideo',
  '-pix_fmt', 'rgba',
  rawOut
]);

const buffer = fs.readFileSync(rawOut);
const width = 330;
const height = 440;

// Now let's examine pixel colors
// Let's create an output RGBA buffer where grass is transparent (alpha = 0)
const outBuffer = Buffer.from(buffer);

for (let i = 0; i < outBuffer.length; i += 4) {
  const r = outBuffer[i];
  const g = outBuffer[i + 1];
  const b = outBuffer[i + 2];

  // Grass characteristics:
  // Green is dominant: g > r * 1.05 and g > b * 1.25 and g > 50
  // Background bushes/fence at the top:
  // Top 10% can have rocks/background
  const y = Math.floor((i / 4) / width);
  const x = (i / 4) % width;

  const isGreenGrass = (g > r * 1.02 && g > b * 1.2 && g > 60);
  const isBackdropRocks = (y < 90 && (x < 70 || x > 240));

  if (isGreenGrass || isBackdropRocks) {
    outBuffer[i + 3] = 0; // Transparent
  }
}

const keyedRaw = path.join(__dirname, 'test_custom_keyed.raw');
fs.writeFileSync(keyedRaw, outBuffer);

const finalPng = path.join(__dirname, 'test_custom_keyed.png');
execFileSync(ffmpegStatic, [
  '-y',
  '-f', 'rawvideo',
  '-pixel_format', 'rgba',
  '-video_size', `${width}x${height}`,
  '-i', keyedRaw,
  finalPng
]);

console.log('Saved test_custom_keyed.png');
