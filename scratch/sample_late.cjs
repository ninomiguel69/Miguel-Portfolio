const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const dir = path.resolve('scratch', 'late_test');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Check 67s to 75s
for (let s = 67; s <= 75; s += 0.5) {
  const pad = s.toFixed(1);
  execSync(`"${ffmpeg}" -y -ss ${s} -i "Dancing Video Updated.mp4" -vf "crop=300:460:370:220,scale=160:245" -vframes 1 "${path.join(dir, 'f_' + pad + '.jpg')}"`, { stdio: 'ignore' });
}
console.log('Done extracting late test');
