const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

const videoPath = path.resolve('Dancing Video Updated.mp4');
const outDir = path.resolve('scratch', 'dance_routine_54_60');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract at 10 fps from 54.0s to 59.0s (5 seconds = 50 frames)
// crop=250:410:280:130
for (let i = 0; i <= 40; i++) {
  const t = (54.5 + i * 0.1).toFixed(2);
  const pad = String(i).padStart(2, '0');
  const outFile = path.join(outDir, `frame_${pad}_${t}s.jpg`);
  try {
    execSync(`"${ffmpeg}" -y -ss ${t} -i "${videoPath}" -vf "crop=240:400:290:135,scale=150:250" -vframes 1 "${outFile}"`, { stdio: 'ignore' });
  } catch (e) {}
}
console.log('Extracted 41 frames from 54.5s to 58.5s');
