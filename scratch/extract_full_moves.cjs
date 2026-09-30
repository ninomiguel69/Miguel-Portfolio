const { execFileSync } = require('child_process');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

for (let i = 0; i < 40; i++) {
  const t = (55.0 + i * 0.1).toFixed(2);
  const pad = String(i).padStart(2, '0');
  const outFile = path.join(__dirname, `full_move_${pad}_${t}s.jpg`);
  execFileSync(ffmpeg, [
    '-y',
    '-ss', t,
    '-i', path.join(__dirname, '../Dancing Video Updated.mp4'),
    '-vf', 'crop=240:390:290:140',
    '-vframes', '1',
    outFile
  ]);
}
console.log('Full moves extracted');
