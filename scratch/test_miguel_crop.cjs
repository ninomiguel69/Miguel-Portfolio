const { execFileSync } = require('child_process');
const path = require('path');
const ffmpeg = 'D:\\Portfolio Website\\node_modules\\ffmpeg-static\\ffmpeg.exe';

// Test cropping Miguel at 56s, 60s, 64s
// Let's test a crop box around x=280..520, y=140..520 (width=240, height=380)
const crops = [
  { name: 'crop_56s', time: '56.0', crop: 'crop=240:380:290:150' },
  { name: 'crop_60s', time: '60.0', crop: 'crop=240:380:290:150' },
  { name: 'crop_64s', time: '64.0', crop: 'crop=240:380:290:150' },
  { name: 'crop_68s', time: '68.0', crop: 'crop=240:380:290:150' },
];

for (const c of crops) {
  const outFile = path.join(__dirname, `${c.name}.jpg`);
  execFileSync(ffmpeg, [
    '-y',
    '-ss', c.time,
    '-i', path.join(__dirname, '../Dancing Video Updated.mp4'),
    '-vf', `${c.crop}`,
    '-vframes', '1',
    outFile
  ]);
  console.log(`Saved ${c.name}.jpg`);
}
