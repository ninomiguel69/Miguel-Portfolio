const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

const videoPath = path.resolve('Dancing Video Updated.mp4');

let probe = '';
try {
  probe = execSync(`"${ffmpeg}" -i "${videoPath}"`, { encoding: 'utf8' });
} catch (e) {
  probe = (e.stdout || '') + '\n' + (e.stderr || '');
}

console.log('Duration line:', probe.split('\n').find(l => l.includes('Duration')));
console.log('Video line:', probe.split('\n').find(l => l.includes('Video:')));

const scanDir = path.resolve('scratch', 'full_scan');
if (!fs.existsSync(scanDir)) fs.mkdirSync(scanDir, { recursive: true });

for (let s = 50; s <= 75; s += 1) {
  const pad = String(s).padStart(2, '0');
  const outFile = path.join(scanDir, `sec_${pad}.jpg`);
  try {
    execSync(`"${ffmpeg}" -y -ss ${s} -i "${videoPath}" -vf "crop=320:460:260:100,scale=160:230" -vframes 1 "${outFile}"`, { stdio: 'ignore' });
  } catch (e) {}
}
console.log('Extracted frames 50s-75s successfully');
