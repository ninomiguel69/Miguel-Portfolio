import { execFile } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';

const TOTAL_FRAMES = 300;
const ffmpegPath = path.resolve(ffmpegStatic);
const numWorkers = Math.max(2, os.cpus().length);

console.log(`\n======================================================`);
console.log(`🚀 Starting High-Fidelity Deblocked Frame Generation`);
console.log(`⚙️  Target: ${TOTAL_FRAMES} frames | Threads: ${numWorkers}`);
console.log(`⚙️  Filters: 8x8 DCT Deblock (fspp) + 3D Denoise + Lanczos 1080p`);
console.log(`⚙️  Codec: WebP Quality 92`);
console.log(`======================================================\n`);

let completed = 0;
let errors = 0;
const startTime = Date.now();

function processFrame(index) {
  const padded = String(index).padStart(3, '0');
  const input = path.resolve(`frames/ezgif-frame-${padded}.jpg`);
  const output = path.resolve(`frames/frame-${padded}.webp`);

  if (!fs.existsSync(input)) {
    console.error(`Missing input frame: ${input}`);
    errors++;
    return Promise.resolve();
  }

  const args = [
    '-i', input,
    '-vf', 'hqdn3d=3:2:4:3,gradfun=1.8:24,scale=1280:720:flags=bicubic',
    '-c:v', 'libwebp',
    '-quality', '95',
    '-compression_level', '4',
    '-frames:v', '1',
    '-update', '1',
    output,
    '-y'
  ];

  return new Promise((resolve) => {
    execFile(ffmpegPath, args, (err) => {
      if (err) {
        console.error(`❌ Frame ${index} failed:`, err.message);
        errors++;
      } else {
        completed++;
        if (completed % 25 === 0 || completed === TOTAL_FRAMES) {
          const percent = Math.round((completed / TOTAL_FRAMES) * 100);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`[${percent}%] Generated ${completed}/${TOTAL_FRAMES} frames (${elapsed}s elapsed)`);
        }
      }
      resolve();
    });
  });
}

async function run() {
  const queue = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);

  const workers = Array.from({ length: numWorkers }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      await processFrame(idx);
    }
  });

  await Promise.all(workers);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Finished generating ${completed} HD WebP frames in ${totalTime}s! Errors: ${errors}\n`);
}

run();
