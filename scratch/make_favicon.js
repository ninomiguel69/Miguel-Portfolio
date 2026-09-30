import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(__dirname, '../assets/tiger-logo.svg');
const output = path.join(__dirname, '../favicon.ico');

try {
  execFileSync(ffmpegStatic, ['-y', '-i', input, '-vf', 'scale=32:32', output]);
  console.log('Successfully created favicon.ico at', output);
} catch (err) {
  console.error('Error generating favicon:', err.message);
}
