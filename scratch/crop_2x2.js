import { execSync } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const ffmpeg = ffmpegStatic;
execSync(`"${ffmpeg}" -i assets/nino-suit.jpg -vf "crop=620:620:74:100,scale=600:600" -q:v 2 assets/nino-profile-2x2.jpg -y`);
console.log('2x2 cropped successfully: assets/nino-profile-2x2.jpg');
