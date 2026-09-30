const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';
if (!fs.existsSync('scratch')) {
  fs.mkdirSync('scratch');
}

for (let t = 0; t <= 85; t += 5) {
  const pad = String(t).padStart(2, '0');
  const outPath = `scratch/timeline_${pad}s.jpg`;
  try {
    execSync(`"${ffmpeg}" -ss ${t} -i "Dancing Video Updated.mp4" -vframes 1 -q:v 2 -y "${outPath}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error(`Failed at ${t}s:`, e.message);
  }
}
console.log('Done extracting timeline frames');
