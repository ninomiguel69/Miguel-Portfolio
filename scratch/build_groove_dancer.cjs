const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const inDir = path.resolve('scratch', 'dance_routine_54_60');
const outDir = path.resolve('scratch', 'clean_groove_set');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function processOne(inFile, outFile) {
  const inPath = path.join(inDir, inFile);
  const outPath = path.join(outDir, outFile);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
    console.log(`Skipping ${outFile}, already exists.`);
    return;
  }
  console.log(`Processing ${inFile}...`);
  const start = Date.now();
  const buf = fs.readFileSync(inPath);
  const blob = new Blob([buf], { type: 'image/jpeg' });
  const res = await removeBackground(blob, { output: { format: 'image/png' } });
  const ab = await res.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(ab));
  console.log(`✓ Finished ${outFile} in ${Math.round((Date.now() - start)/1000)}s`);
}

async function run() {
  console.log('Building clean groove set (no head-rock intersection)...');

  // Copy already clean ready frames
  fs.copyFileSync('scratch/par_clean_0.png', path.join(outDir, 'frame_00.png'));
  fs.copyFileSync('scratch/clean_sample_0.png', path.join(outDir, 'frame_01.png'));

  // Process 4 frames
  await processOne('frame_28_57.30s.jpg', 'frame_02.png');
  await processOne('frame_30_57.50s.jpg', 'frame_03.png');
  await processOne('frame_33_57.80s.jpg', 'frame_04.png');
  await processOne('frame_36_58.10s.jpg', 'frame_05.png');

  console.log('All 6 key groove frames ready! Compiling animated WebP...');

  // Create smooth 10-frame seamless loop: 0, 1, 2, 3, 4, 5, 4, 3, 2, 1
  const animDir = path.join(outDir, 'anim');
  if (!fs.existsSync(animDir)) fs.mkdirSync(animDir, { recursive: true });

  const loop = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
  for (let i = 0; i < loop.length; i++) {
    const src = path.join(outDir, `frame_0${loop[i]}.png`);
    const dest = path.join(animDir, `anim_${String(i).padStart(2, '0')}.png`);
    fs.copyFileSync(src, dest);
  }

  const targetWebp = path.resolve('assets', 'miguel-dancer.webp');
  execFileSync(ffmpeg, [
    '-y',
    '-framerate', '8',
    '-i', path.join(animDir, 'anim_%02d.png'),
    '-vcodec', 'libwebp',
    '-filter_complex', '[0:v] scale=180:-1:flags=lanczos [v]',
    '-map', '[v]',
    '-lossless', '0',
    '-q:v', '85',
    '-loop', '0',
    '-pix_fmt', 'yuva420p',
    targetWebp
  ]);

  console.log('✓ Successfully created miguel-dancer.webp! Size:', fs.statSync(targetWebp).size);
}

run().catch(console.error);
