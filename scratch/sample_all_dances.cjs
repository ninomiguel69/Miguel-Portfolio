const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const dir = path.resolve('scratch', 'groove_test');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Check 32s to 40s
for (let s = 32; s <= 40; s += 0.5) {
  const pad = s.toFixed(1);
  execSync(`"${ffmpeg}" -y -ss ${s} -i "Dancing Video Updated.mp4" -vf "crop=300:460:150:180,scale=160:245" -vframes 1 "${path.join(dir, 'f_' + pad + '.jpg')}"`, { stdio: 'ignore' });
}
console.log('Done extracting groove test');
