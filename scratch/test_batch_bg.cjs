const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

async function testBatch() {
  console.log('Testing batch processing speed...');
  const inDir = path.resolve('scratch', 'dance_routine_54_60');
  const files = [
    'frame_05_55.00s.jpg',
    'frame_10_55.50s.jpg',
    'frame_15_56.00s.jpg',
    'frame_20_56.50s.jpg',
    'frame_25_57.00s.jpg'
  ];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const start = Date.now();
    const inPath = path.join(inDir, f);
    const imgBuf = fs.readFileSync(inPath);
    const blob = new Blob([imgBuf], { type: 'image/jpeg' });
    const resultBlob = await removeBackground(blob, {
      output: { format: 'image/png' }
    });
    const ab = await resultBlob.arrayBuffer();
    const outPath = path.resolve('scratch', `clean_sample_${i}.png`);
    fs.writeFileSync(outPath, Buffer.from(ab));
    console.log(`Frame ${i + 1}/${files.length} done in ${Date.now() - start} ms`);
  }
}

testBatch().catch(console.error);
