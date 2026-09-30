import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');

// Extract 1 frame per second from 1 to 18s
for (let s = 1; s <= 18; s += 2) {
  const outPath = path.join(__dirname, `frame_${s}s.jpg`);
  execFileSync(ffmpegStatic, ['-y', '-ss', `${s}`, '-i', videoPath, '-vframes', '1', outPath]);
  console.log(`Saved ${s}s`);
}
