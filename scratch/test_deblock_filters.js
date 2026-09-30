import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const input = 'frames/ezgif-frame-150.jpg';

// Test A: gradfun + bilateral/smartblur + Lanczos + CAS
const outA = 'scratch/test_filter_A.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'deblock=filter=weak:block=8,gradfun=1.5:16,scale=1920:1080:flags=lanczos,cas=0.5',
  '-c:v', 'libwebp',
  '-quality', '94',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  outA,
  '-y'
]);

// Test B: smartblur on low-contrast regions + gradfun + lanczos + subtle cas
const outB = 'scratch/test_filter_B.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'smartblur=lr=1.5:ls=-0.5:lt=-25:cr=1.5:cs=-0.5:ct=-25,gradfun=1.8:24,scale=1920:1080:flags=lanczos,unsharp=3:3:0.8:3:3:0.0',
  '-c:v', 'libwebp',
  '-quality', '94',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  outB,
  '-y'
]);

// Test C: pp (postprocessing) deblock + scale 1920:1080 lanczos + cas
const outC = 'scratch/test_filter_C.webp';
execFileSync(ffmpegStatic, [
  '-i', input,
  '-vf', 'pp=hb/vb/dr,gradfun=1.5:16,scale=1920:1080:flags=lanczos,cas=0.4',
  '-c:v', 'libwebp',
  '-quality', '94',
  '-compression_level', '3',
  '-frames:v', '1',
  '-update', '1',
  outC,
  '-y'
]);

// Generate 4-way comparison crop
execFileSync(ffmpegStatic, [
  '-i', 'frames/frame-150.webp',
  '-i', outA,
  '-i', outB,
  '-i', outC,
  '-filter_complex', '[0:v]crop=300:400:900:400[c0];[1:v]crop=300:400:900:400[c1];[2:v]crop=300:400:900:400[c2];[3:v]crop=300:400:900:400[c3];[c0][c1][c2][c3]hstack=inputs=4[out]',
  '-map', '[out]',
  'scratch/crop_filter_compare.png',
  '-y'
]);

console.log('Filter comparison done!');
