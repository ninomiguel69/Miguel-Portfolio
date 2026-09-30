const { execFileSync } = require('child_process');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

for (let i = 0; i <= 24; i++) {
  const t = (64.0 + i * 0.5).toFixed(2);
  const pad = String(i).padStart(2, '0');
  const outFile = path.join(__dirname, `late_dance_${pad}_${t}s.jpg`);
  execFileSync(ffmpeg, [
    '-y',
    '-ss', t,
    '-i', path.join(__dirname, '../Dancing Video Updated.mp4'),
    '-vf', 'scale=512:288',
    '-vframes', '1',
    outFile
  ]);
}
console.log('Late frames extracted');
