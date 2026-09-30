const { execFileSync } = require('child_process');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

for (let i = 0; i <= 10; i++) {
  const t = (1.5 + i * 0.5).toFixed(2);
  const outFile = path.join(__dirname, `early_dance_${i}_${t}s.jpg`);
  execFileSync(ffmpeg, [
    '-y',
    '-ss', t,
    '-i', path.join(__dirname, '../Dancing Video Updated.mp4'),
    '-vf', 'scale=512:288',
    '-vframes', '1',
    outFile
  ]);
}
console.log('Early frames extracted');
