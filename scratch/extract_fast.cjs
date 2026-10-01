const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

const videoPath = path.resolve('Dancing Video Updated.mp4');
const outDir = path.resolve('scratch', 'dance_routine_58_64');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract with 1 single ffmpeg call: 58.0 to 64.0 (6 seconds @ 10fps)
execSync(`"${ffmpeg}" -y -ss 58.0 -t 6.0 -i "${videoPath}" -vf "fps=10,crop=240:400:290:135,scale=150:250" "${path.join(outDir, 'f_%03d.jpg')}"`);
console.log('Done extracting 58-64s');
