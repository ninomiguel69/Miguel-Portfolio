import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');

// Crop the male in yellow t-shirt (approx x=280, y=90, w=330, h=450)
// and apply chromakey/colorkey on the green grass
const outSample = path.join(__dirname, 'test_crop.png');

try {
  // Let's test a simple crop first at 3.5s
  execFileSync(ffmpegStatic, [
    '-y',
    '-ss', '3.5',
    '-i', videoPath,
    '-vf', 'crop=330:440:290:80',
    '-vframes', '1',
    outSample
  ]);
  console.log('Saved test_crop.png');
} catch (err) {
  console.error(err);
}
