const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const dir = path.resolve('scratch', 'clean_groove_set');

async function cleanAll() {
  const files = ['frame_00.png', 'frame_01.png', 'frame_02.png', 'frame_03.png', 'frame_04.png', 'frame_05.png'];
  
  for (const f of files) {
    const p = path.join(dir, f);
    const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // In these groove frames, his head starts below y=40.
    // Anything at y < 38 is definitely background artifact.
    // Also from y=38 to 55, if x < 50 or x > 105, or if pixel is grayish / not skin / not hair:
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const a = data[idx + 3];
        if (a > 10) {
          if (y < 38) {
            data[idx + 3] = 0; // 100% clean top
          } else if (y < 55) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // If it's a thin spire or narrow stray artifact not connected to head (e.g. x < 55 or x > 95)
            if (x < 55 || x > 95) {
              data[idx + 3] = 0;
            } else if (r < 110 && g < 110 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8) {
              // Grey stone
              data[idx + 3] = 0;
            }
          }
        }
      }
    }

    const cleanPath = path.join(dir, `clean_${f}`);
    await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(cleanPath);
    console.log(`Cleaned ${f} -> clean_${f}`);
  }

  // Now assemble animated webp
  const animDir = path.join(dir, 'anim_clean');
  if (!fs.existsSync(animDir)) fs.mkdirSync(animDir, { recursive: true });

  const loop = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
  for (let i = 0; i < loop.length; i++) {
    const src = path.join(dir, `clean_frame_0${loop[i]}.png`);
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

  console.log('✓ Successfully created clean miguel-dancer.webp at:', targetWebp);
}

cleanAll().catch(console.error);
