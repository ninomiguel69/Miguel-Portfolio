const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const dir = path.resolve('scratch', 'clean_groove_set');

async function fixHeadTrim() {
  const files = ['frame_00.png', 'frame_01.png', 'frame_02.png', 'frame_03.png', 'frame_04.png', 'frame_05.png'];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const p = path.join(dir, f);
    const { data, info } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Scan columns x from 55 to 95 for first hair or skin pixel:
    let headTopY = 30;
    for (let y = 25; y < 70; y++) {
      let found = false;
      for (let x = 60; x < 90; x++) {
        const idx = (y * w + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a > 50) {
          if ((r - b > 15 && r > 65) || (r > 120 && r - b > 25)) {
            headTopY = y;
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    // Only clear strictly above his head (y < headTopY - 2 to be safe for hair)
    const cutY = Math.max(0, headTopY - 1);
    for (let y = 0; y < cutY; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        data[idx + 3] = 0;
      }
    }

    const cleanPath = path.join(dir, `clean_${f}`);
    await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(cleanPath);
    console.log(`${f}: cut above y=${cutY}`);
  }

  // Assemble animated webp
  const animDir = path.join(dir, 'anim_clean');
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

  console.log('✓ Re-exported perfect miguel-dancer.webp!');
}

fixHeadTrim().catch(console.error);
