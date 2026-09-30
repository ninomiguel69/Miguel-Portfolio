const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { removeBackground } = require('@imgly/background-removal-node');

const ffmpegPath = require('ffmpeg-static');
const videoPath = path.resolve('Dancing Video Updated.mp4');
const framesDir = path.resolve('scratch', 'dance_frames');
const cleanDir = path.resolve('scratch', 'clean_dance_frames');

if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
if (!fs.existsSync(cleanDir)) fs.mkdirSync(cleanDir, { recursive: true });

async function main() {
  console.log('Extracting frames from Dancing Video Updated.mp4...');
  // Let's extract 30 frames from 55.0s to 58.0s (3.0 seconds @ 10fps = 30 frames)
  // crop=240:390:290:140 (width: 240, height: 390, x: 290, y: 140)
  const extractCmd = `"${ffmpegPath}" -y -ss 55.0 -t 3.0 -i "${videoPath}" -vf "crop=240:390:290:140,fps=10" "${path.join(framesDir, 'frame_%03d.png')}"`;
  execSync(extractCmd, { stdio: 'inherit' });

  const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
  console.log(`Extracted ${frameFiles.length} frames.`);

  console.log('Processing frames with AI background removal...');
  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const inPath = path.join(framesDir, file);
    const outPath = path.join(cleanDir, file);

    const imgBuf = fs.readFileSync(inPath);
    const blob = new Blob([imgBuf], { type: 'image/png' });
    const resultBlob = await removeBackground(blob, {
      output: {
        format: 'image/png'
      }
    });
    const arrayBuffer = await resultBlob.arrayBuffer();
    fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
    console.log(`[${i + 1}/${frameFiles.length}] Cleaned ${file}`);
  }

  console.log('Assembling clean frames into animated WebP...');
  const targetWebp = path.resolve('assets', 'miguel-dancer.webp');
  // We can compile directly with ffmpeg
  // -framerate 10 -i clean_frame_%03d.png -loop 0 -vcodec libwebp -lossless 0 -qscale 80 -preset default assets/miguel-dancer.webp
  const buildCmd = `"${ffmpegPath}" -y -framerate 10 -i "${path.join(cleanDir, 'frame_%03d.png')}" -vcodec libwebp -filter_complex "[0:v] scale=180:-1:flags=lanczos [v]" -map "[v]" -loop 0 -q:v 80 "${targetWebp}"`;
  execSync(buildCmd, { stdio: 'inherit' });

  console.log('Done! Created:', targetWebp);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
