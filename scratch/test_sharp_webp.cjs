const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function testSharpWebp() {
  const dir = path.resolve('scratch', 'clean_groove_set', 'anim_clean');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();
  console.log('Testing sharp with', files.length, 'frames');

  // Load first image to get dimensions
  const meta = await sharp(path.join(dir, files[0])).metadata();
  console.log(`Frame dimensions: ${meta.width}x${meta.height}`);

  // Stack images vertically
  const compositeList = [];
  for (let i = 0; i < files.length; i++) {
    compositeList.push({
      input: path.join(dir, files[i]),
      top: i * meta.height,
      left: 0
    });
  }

  const tall = await sharp({
    create: {
      width: meta.width,
      height: meta.height * files.length,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(compositeList)
  .png()
  .toBuffer();

  const testWebp = path.resolve('scratch', 'sharp_test.webp');
  await sharp(tall)
    .webp({
      pageHeight: meta.height,
      loop: 0,
      quality: 85,
      lossless: false
    })
    .toFile(testWebp);

  console.log('Created sharp_test.webp, size:', fs.statSync(testWebp).size);

  // Inspect the created webp!
  const buf = fs.readFileSync(testWebp);
  let offset = 12;
  let frameIdx = 0;
  while (offset < buf.length) {
    const fourcc = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (fourcc === 'ANIM') {
      const bgB = buf.readUInt8(offset + 8);
      const bgG = buf.readUInt8(offset + 9);
      const bgR = buf.readUInt8(offset + 10);
      const bgA = buf.readUInt8(offset + 11);
      const loop = buf.readUInt16LE(offset + 12);
      console.log(`  ANIM: BG=(R:${bgR}, G:${bgG}, B:${bgB}, A:${bgA}), loop: ${loop}`);
    }
    if (fourcc === 'ANMF') {
      const flags = buf.readUInt8(offset + 23);
      const blend = (flags & 2) !== 0;
      const dispose = (flags & 1) !== 0;
      console.log(`  Frame ${frameIdx++}: flags byte: 0b${flags.toString(2).padStart(8, '0')} (0x${flags.toString(16)}), dispose_to_bg: ${dispose}, no_blend: ${blend}`);
    }
    offset += 8 + size + (size % 2);
  }
}

testSharpWebp().catch(console.error);
