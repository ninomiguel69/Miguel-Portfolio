import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');

// Extract 10 frames from 2.0s to 5.5s with crop=300:430:290:80
for (let i = 0; i < 8; i++) {
  const t = (2.0 + i * 0.5).toFixed(2);
  const outPath = path.join(__dirname, `dance_${i}_${t}s.png`);
  execFileSync(ffmpegStatic, [
    '-y',
    '-ss', `${t}`,
    '-i', videoPath,
    '-vf', 'crop=320:440:290:80,scale=160:220',
    '-vframes', '1',
    outPath
  ]);
  console.log(`Extracted dance frame at ${t}s`);
}
