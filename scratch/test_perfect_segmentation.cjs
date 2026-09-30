const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

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

function processFrame(inputJpg, outputPng) {
  const rawPath = path.join(__dirname, 'temp_in.raw');
  execFileSync(ffmpeg, [
    '-y',
    '-i', inputJpg,
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    rawPath
  ]);

  const buf = fs.readFileSync(rawPath);
  const outBuf = Buffer.from(buf);

  const isBgCandidate = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = buf[idx];
      const g = buf[idx + 1];
      const b = buf[idx + 2];
      const { h, s, l } = rgbToHsl(r, g, b);

      // Person features
      const isYellowShirt = (r > 130 && g > 120 && b < 140 && r > b * 1.3 && h >= 35 && h <= 66);
      const isSkin = (r > 100 && g > 60 && b > 35 && (r - b > 30) && (r >= g) && h >= 10 && h <= 48 && s > 0.14);
      const isHair = (y < 120 && y > 35 && x > 80 && x < 155 && (r - b > 28) && l < 0.65);
      const isJeans = (y > 150 && y < 365 && r < 125 && g < 140 && b < 165 && (b >= r - 12 || b >= g - 12) && l > 0.08 && l < 0.55 && (h >= 170 || h <= 40 || s < 0.28));
      const isShoes = (y >= 335 && (r > 110 && g > 110 && b > 95) && Math.abs(r - g) < 30 && Math.abs(g - b) < 30);

      const isPerson = isYellowShirt || isSkin || isHair || isJeans || isShoes;

      // Background candidates:
      // 1. Grass (green dominant or green hue)
      const isGrass = (g > r + 6 && g > b + 10 && h >= 62 && h <= 175 && s > 0.10);
      // 2. Head zone background (rock fountain, white chair, patio wall, black fence)
      // Any pixel at y < 130 that lacks warm skin/shirt/hair r - b difference:
      const isUpperBg = (y < 135 && (r - b < 30 || isGrass || l > 0.68 || s < 0.22));
      // 3. Top of frame
      const isVeryTop = (y < 40);
      // 4. Far borders
      const isFarLeft = (x < 32);
      const isFarRight = (x > 195);
      // 5. Ground / lawn below feet
      const isBottomGround = (y > 368);

      if (!isPerson && (isGrass || isUpperBg || isVeryTop || isFarLeft || isFarRight || isBottomGround)) {
        isBgCandidate[y * width + x] = 1;
      }
    }
  }

  // Flood fill from outer edges
  const visited = new Uint8Array(width * height);
  const queue = [];

  function pushSeed(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (!visited[p] && isBgCandidate[p]) {
      visited[p] = 1;
      queue.push(p);
    }
  }

  // Border seeds
  for (let x = 0; x < width; x++) {
    pushSeed(x, 0);
    pushSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushSeed(0, y);
    pushSeed(width - 1, y);
  }

  // Top corners & upper background seeds
  for (let y = 0; y < 100; y += 4) {
    for (let x = 0; x < 70; x += 4) pushSeed(x, y);
    for (let x = 160; x < width; x += 4) pushSeed(x, y);
  }

  // Internal seed for grass between legs
  for (let y = 280; y <= 350; y += 5) {
    for (let x = 105; x <= 135; x += 5) {
      pushSeed(x, y);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const x = p % width;
    const y = Math.floor(p / width);

    pushSeed(x + 1, y);
    pushSeed(x - 1, y);
    pushSeed(x, y + 1);
    pushSeed(x, y - 1);
  }

  // Alpha assignment & green despill
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const idx = p * 4;

      if (visited[p]) {
        outBuf[idx + 3] = 0; // Transparent
      } else {
        let r = outBuf[idx];
        let g = outBuf[idx + 1];
        let b = outBuf[idx + 2];

        // Green despill
        const maxNonGreen = Math.max(r, b);
        if (g > maxNonGreen && maxNonGreen > 50) {
          outBuf[idx + 1] = Math.round((r + b) / 2);
        }
        outBuf[idx + 3] = 255;
      }
    }
  }

  // Edge anti-aliasing / smoothing
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const idx = p * 4;
      if (outBuf[idx + 3] === 255) {
        let trans = 0;
        if (outBuf[((y - 1) * width + x) * 4 + 3] === 0) trans++;
        if (outBuf[((y + 1) * width + x) * 4 + 3] === 0) trans++;
        if (outBuf[(y * width + (x - 1)) * 4 + 3] === 0) trans++;
        if (outBuf[(y * width + (x + 1)) * 4 + 3] === 0) trans++;

        if (trans >= 2) {
          outBuf[idx + 3] = 160;
        } else if (trans === 1) {
          outBuf[idx + 3] = 210;
        }
      }
    }
  }

  const outRaw = path.join(__dirname, 'temp_out.raw');
  fs.writeFileSync(outRaw, outBuf);

  execFileSync(ffmpeg, [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgba',
    '-video_size', `${width}x${height}`,
    '-i', outRaw,
    outputPng
  ]);

  try {
    fs.unlinkSync(rawPath);
    fs.unlinkSync(outRaw);
  } catch (e) {}
}

module.exports = { processFrame };

if (require.main === module) {
  processFrame(
    path.join(__dirname, 'full_move_10_56.00s.jpg'),
    path.join(__dirname, 'test_clean_cutout_56s.png')
  );
  processFrame(
    path.join(__dirname, 'full_move_20_57.00s.jpg'),
    path.join(__dirname, 'test_clean_cutout_57s.png')
  );
  processFrame(
    path.join(__dirname, 'full_move_30_58.00s.jpg'),
    path.join(__dirname, 'test_clean_cutout_58s.png')
  );
  console.log('Processed 56s, 57s, 58s test frames');
}
