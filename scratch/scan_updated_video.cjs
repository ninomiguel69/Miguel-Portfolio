const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const outDir = path.join(__dirname, 'video_scan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Extract 1 frame every 4 seconds from 0 to 88s
for (let s = 0; s <= 88; s += 4) {
  const pad = String(s).padStart(3, '0');
  const outFile = path.join(outDir, `scan_${pad}s.jpg`);
  try {
    execFileSync(ffmpeg, [
      '-y',
      '-ss', String(s),
      '-i', path.join(__dirname, '../Dancing Video Updated.mp4'),
      '-vf', 'scale=512:288',
      '-vframes', '1',
      outFile
    ]);
  } catch (e) {
    console.error('Error at', s, e.message);
  }
}
console.log('Scan completed');
