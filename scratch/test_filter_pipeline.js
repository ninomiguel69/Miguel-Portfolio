import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import fs from 'fs';

const input = 'frames/ezgif-frame-001.jpg';

// Test 1: CAS 0.6 + Lanczos 1080p
const out1 = 'scratch/test_cas_1080.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'scale=1920:1080:flags=lanczos,cas=0.6',
  '-c:v', 'libwebp',
  '-quality', '94',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  out1,
  '-y'
]);
console.log('Test 1 size:', fs.statSync(out1).size);

// Test 2: Deblock weak + Lanczos 1080p + CAS 0.7
const out2 = 'scratch/test_deblock_cas_1080.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'deblock=filter=weak:block=4,scale=1920:1080:flags=lanczos,cas=0.7',
  '-c:v', 'libwebp',
  '-quality', '94',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  out2,
  '-y'
]);
console.log('Test 2 size:', fs.statSync(out2).size);

// Test 3: Lanczos 2560x1440 QHD + CAS 0.6
const out3 = 'scratch/test_cas_1440.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'deblock=filter=weak:block=4,scale=2560:1440:flags=lanczos,cas=0.6',
  '-c:v', 'libwebp',
  '-quality', '92',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  out3,
  '-y'
]);
console.log('Test 3 size:', fs.statSync(out3).size);

console.log('Existing frame-001.webp size:', fs.statSync('frames/frame-001.webp').size);
