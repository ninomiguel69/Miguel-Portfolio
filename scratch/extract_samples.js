import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');

// Extract a few frames: at 2s, 5s, 8s, 12s
for (const sec of [2, 5, 8, 12]) {
  const outPath = path.join(__dirname, `sample_${sec}s.jpg`);
  execFileSync(ffmpegStatic, ['-y', '-ss', `${sec}`, '-i', videoPath, '-vframes', '1', outPath]);
  console.log('Saved', outPath);
}
