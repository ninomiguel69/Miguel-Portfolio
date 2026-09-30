import { execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const ffmpeg = ffmpegStatic;
execSync(`"${ffmpeg}" -i frames/ezgif-frame-080.jpg -vf "hqdn3d=4:3:6:4.5,gradfun=2.0:32" -c:v libwebp -quality 95 scratch/test_smooth_080.webp -y`);
console.log('Generated test_smooth_080.webp');
