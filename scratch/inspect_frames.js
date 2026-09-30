import fs from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const filesToCheck = [
  'frames/ezgif-frame-001.jpg',
  'frames/ezgif-frame-150.jpg',
  'frames/frame-001.webp',
  'frames/frame-150.webp'
];

for (const file of filesToCheck) {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  const stat = fs.statSync(fullPath);
  try {
    const output = execFileSync(ffmpegStatic, ['-i', fullPath], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`=== ${file} (${stat.size} bytes) ===\n`, output);
  } catch (err) {
    const info = (err.stderr || err.stdout || err.message).split('\n').filter(l => l.includes('Stream') || l.includes('Input') || l.includes('Duration') || l.includes('Video')).join('\n');
    console.log(`=== ${file} (${stat.size} bytes) ===\n${info}\n`);
  }
}
