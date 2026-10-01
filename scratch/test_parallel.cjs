const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

async function testParallel() {
  const in1 = path.resolve('scratch', 'dance_routine_54_60', 'frame_00_54.50s.jpg');
  const in2 = path.resolve('scratch', 'dance_routine_54_60', 'frame_10_55.50s.jpg');

  const start = Date.now();
  console.log('Testing 2 parallel background removals...');

  const runOne = async (inPath, outPath) => {
    const buf = fs.readFileSync(inPath);
    const blob = new Blob([buf], { type: 'image/jpeg' });
    const res = await removeBackground(blob, { output: { format: 'image/png' } });
    const ab = await res.arrayBuffer();
    fs.writeFileSync(outPath, Buffer.from(ab));
  };

  await Promise.all([
    runOne(in1, path.resolve('scratch', 'par_clean_0.png')),
    runOne(in2, path.resolve('scratch', 'par_clean_1.png'))
  ]);

  console.log('Finished 2 frames in', (Date.now() - start) / 1000, 'seconds');
}

testParallel().catch(console.error);
