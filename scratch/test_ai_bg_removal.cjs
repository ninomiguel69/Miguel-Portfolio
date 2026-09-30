const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

async function test() {
  console.log('Testing AI background removal on crop_56s.jpg...');
  const inputPath = path.join(__dirname, 'crop_56s.jpg');
  const buffer = fs.readFileSync(inputPath);
  const blob = new Blob([buffer], { type: 'image/jpeg' });

  const resultBlob = await removeBackground(blob, {
    output: {
      format: 'image/png',
      quality: 0.95
    }
  });

  const arrayBuffer = await resultBlob.arrayBuffer();
  const outPath = path.join(__dirname, 'ai_clean_cutout_56s.png');
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
  console.log('Saved ai_clean_cutout_56s.png successfully!');
}

test().catch(err => console.error('Error:', err));
