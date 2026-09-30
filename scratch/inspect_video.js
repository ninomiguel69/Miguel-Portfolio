import ffmpegStatic from 'ffmpeg-static';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPath = path.join(__dirname, '../Dancing Video.mp4');

execFile(ffmpegStatic, ['-i', videoPath], (err, stdout, stderr) => {
  console.log('--- Video info ---');
  console.log(stderr);
});
