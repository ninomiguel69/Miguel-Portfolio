import ffmpegStatic from 'ffmpeg-static';
import { execFileSync } from 'child_process';

const output = execFileSync(ffmpegStatic, ['-filters'], { encoding: 'utf8' });
const filters = ['cas', 'unsharp', 'scale', 'fspp', 'deblock', 'hqdn3d', 'nlmeans', 'bilateral', 'smartblur', 'sr', 'dnn_processing'];

for (const f of filters) {
  const found = output.split('\n').some(line => line.includes(` ${f} `));
  console.log(`Filter ${f}: ${found ? 'AVAILABLE' : 'NOT FOUND'}`);
}
