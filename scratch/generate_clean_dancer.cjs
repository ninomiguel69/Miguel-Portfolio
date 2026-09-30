const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { removeBackground } = require('@imgly/background-removal-node');

const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const videoPath = path.resolve('Dancing Video Updated.mp4');
const outDir = path.resolve('scratch', 'clean_dance_loop');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 8 carefully spaced frames for an energetic dance groove
const frameTimes = [
  '55.40',
  '55.65',
  '55.90',
  '56.15',
  '56.40',
  '56.65',
  '56.90',
  '57.15'
];

async function run() {
  console.log(`Extracting and keying ${frameTimes.length} frames...`);
  const cleanFrames = [];

  for (let i = 0; i < frameTimes.length; i++) {
    const t = frameTimes[i];
    const cropJpg = path.join(outDir, `crop_${i}.jpg`);
    const cleanPng = path.join(outDir, `clean_${String(i).padStart(2, '0')}.png`);

    // Extract cropped frame
    execFileSync(ffmpeg, [
      '-y',
      '-ss', t,
      '-i', videoPath,
      '-vf', 'crop=240:380:290:150',
      '-vframes', '1',
      cropJpg
    ]);

    console.log(`[${i+1}/${frameTimes.length}] Performing AI background removal for t=${t}s...`);
    const imgBuf = fs.readFileSync(cropJpg);
    const blob = new Blob([imgBuf], { type: 'image/jpeg' });
    const resultBlob = await removeBackground(blob, {
      output: { format: 'image/png' }
    });
    const arrayBuffer = await resultBlob.arrayBuffer();
    fs.writeFileSync(cleanPng, Buffer.from(arrayBuffer));
    cleanFrames.push(cleanPng);
    console.log(`✓ Frame ${i+1} saved to ${cleanPng}`);
  }

  // Create ping-pong sequence for seamless loop: 0..7 then 6..1
  const pingPong = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
  const seqDir = path.join(outDir, 'seq');
  if (!fs.existsSync(seqDir)) fs.mkdirSync(seqDir, { recursive: true });

  for (let idx = 0; idx < pingPong.length; idx++) {
    const srcIndex = pingPong[idx];
    const src = cleanFrames[srcIndex];
    const dest = path.join(seqDir, `f_${String(idx).padStart(2, '0')}.png`);
    fs.copyFileSync(src, dest);
  }

  const targetWebp = path.resolve('assets', 'miguel-dancer.webp');
  console.log('Compiling into transparent animated WebP at', targetWebp);

  // Compile transparent animated webp at 10 fps
  execFileSync(ffmpeg, [
    '-y',
    '-framerate', '9',
    '-i', path.join(seqDir, 'f_%02d.png'),
    '-vcodec', 'libwebp',
    '-filter_complex', '[0:v] scale=180:-1:flags=lanczos [v]',
    '-map', '[v]',
    '-lossless', '0',
    '-q:v', '85',
    '-loop', '0',
    '-pix_fmt', 'yuva420p',
    targetWebp
  ]);

  console.log('Successfully generated transparent miguel-dancer.webp! Size:', fs.statSync(targetWebp).size);
}

run().catch(err => {
  console.error('Generation error:', err);
  process.exit(1);
});
