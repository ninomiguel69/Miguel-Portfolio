const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

const animDir = path.resolve('scratch', 'clean_groove_set', 'anim_clean');
const outGif = path.resolve('scratch', 'test_dancer.gif');

execFileSync(ffmpeg, [
  '-y',
  '-framerate', '8',
  '-i', path.join(animDir, 'anim_%02d.png'),
  '-filter_complex', '[0:v] split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse=alpha_threshold=128',
  '-loop', '0',
  outGif
]);

console.log('Created test_dancer.gif, size:', fs.statSync(outGif).size);
