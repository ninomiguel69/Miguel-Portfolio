const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const inDir = path.resolve('scratch', 'dance_routine_54_60');
const outDir = path.resolve('scratch', 'final_dance_frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Function to clean rock above head if present
async function cleanFrameArtifacts(pngPath, destPath) {
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Clear any stray non-person pixels in top area (rock above head)
  for (let y = 0; y < 55; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a > 10) {
        // Rock is dull greyish/brown where r and g and b are close and not warm skin (skin has r > b + 25)
        const isWarmSkin = (r - b > 25 && r > 120 && g > 80);
        const isYellowShirt = (r > 140 && g > 130 && b < 120);
        if (!isWarmSkin && !isYellowShirt && y < 45) {
          data[idx + 3] = 0; // set transparent
        }
      }
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(destPath);
}

async function run() {
  console.log('Starting full dance routine background removal...');

  // 1. Clean existing ready frames
  console.log('1. Processing ready frames...');
  await cleanFrameArtifacts('scratch/par_clean_0.png', path.join(outDir, 'frame_00.png'));
  await cleanFrameArtifacts('scratch/clean_sample_0.png', path.join(outDir, 'frame_01.png'));
  await cleanFrameArtifacts('scratch/par_clean_1.png', path.join(outDir, 'frame_02.png'));
  await cleanFrameArtifacts('scratch/test_clean_frame15.png', path.join(outDir, 'frame_03.png'));

  // 2. Process remaining frames (frame 20, 25, 30, 35)
  const targets = [
    { in: 'frame_20_56.50s.jpg', out: 'frame_04.png' },
    { in: 'frame_25_57.00s.jpg', out: 'frame_05.png' },
    { in: 'frame_30_57.50s.jpg', out: 'frame_06.png' },
    { in: 'frame_35_58.00s.jpg', out: 'frame_07.png' }
  ];

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    const inPath = path.join(inDir, item.in);
    const tempOut = path.join(outDir, `temp_${i}.png`);
    const finalOut = path.join(outDir, item.out);

    console.log(`Processing [${i+1}/${targets.length}] ${item.in}...`);
    const start = Date.now();
    const buf = fs.readFileSync(inPath);
    const blob = new Blob([buf], { type: 'image/jpeg' });
    const res = await removeBackground(blob, { output: { format: 'image/png' } });
    const ab = await res.arrayBuffer();
    fs.writeFileSync(tempOut, Buffer.from(ab));
    await cleanFrameArtifacts(tempOut, finalOut);
    fs.unlinkSync(tempOut);
    console.log(`✓ Finished ${item.out} in ${Math.round((Date.now() - start)/1000)}s`);
  }

  // 3. Assemble seamless 14-frame sequence: 00..07 then 06..01
  console.log('3. Assembling WebP animation...');
  const animDir = path.join(outDir, 'anim');
  if (!fs.existsSync(animDir)) fs.mkdirSync(animDir, { recursive: true });

  const seq = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
  for (let idx = 0; idx < seq.length; idx++) {
    const srcIndex = seq[idx];
    const src = path.join(outDir, `frame_0${srcIndex}.png`);
    const dest = path.join(animDir, `anim_${String(idx).padStart(2, '0')}.png`);
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

  console.log('Successfully generated complete clean miguel-dancer.webp at:', targetWebp);
  console.log('File size:', fs.statSync(targetWebp).size);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
