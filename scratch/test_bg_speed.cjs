const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

async function testOne() {
  const inPath = path.resolve('scratch', 'dance_routine_54_60', 'frame_15_56.00s.jpg');
  const outPath = path.resolve('scratch', 'test_clean_frame15.png');

  const start = Date.now();
  const imgBuf = fs.readFileSync(inPath);
  const blob = new Blob([imgBuf], { type: 'image/jpeg' });
  const resultBlob = await removeBackground(blob, {
    output: { format: 'image/png' }
  });
  const arrayBuffer = await resultBlob.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
  console.log('Processed in', Date.now() - start, 'ms, saved to', outPath);
}

testOne().catch(console.error);
