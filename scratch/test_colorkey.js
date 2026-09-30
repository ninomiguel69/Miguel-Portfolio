import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');
const outSample = path.join(__dirname, 'test_keyed.png');

// Test colorkey filter on grass
try {
  execFileSync(ffmpegStatic, [
    '-y',
    '-ss', '3.5',
    '-i', videoPath,
    '-vf', 'crop=330:440:290:80,colorkey=0x7ca23c:0.32:0.15',
    '-vframes', '1',
    outSample
  ]);
  console.log('Saved test_keyed.png');
} catch (err) {
  console.error(err);
}
