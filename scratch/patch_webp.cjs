const fs = require('fs');

const inBuf = fs.readFileSync('assets/miguel-dancer.webp');
const buf = Buffer.from(inBuf);

let offset = 12;
while (offset < buf.length) {
  const fourcc = buf.toString('ascii', offset, offset + 4);
  const size = buf.readUInt32LE(offset + 4);

  if (fourcc === 'ANIM') {
    // Set BG to (0, 0, 0, 0)
    buf.writeUInt8(0, offset + 8);
    buf.writeUInt8(0, offset + 9);
    buf.writeUInt8(0, offset + 10);
    buf.writeUInt8(0, offset + 11);
    console.log('Patched ANIM BG to (0,0,0,0)');
  }

  if (fourcc === 'ANMF') {
    // Byte 15 of ANMF payload (offset + 8 + 15 = offset + 23)
    const oldFlags = buf.readUInt8(offset + 23);
    // Set D=1 (dispose to background) and B=1 (no blend) -> 0b00000011 (0x03)
    buf.writeUInt8(0x03, offset + 23);
    console.log(`Patched ANMF at ${offset}: 0b${oldFlags.toString(2)} -> 0b00000011 (dispose=1, no_blend=1)`);
  }

  offset += 8 + size + (size % 2);
}

fs.writeFileSync('scratch/patched_dancer.webp', buf);
console.log('Saved scratch/patched_dancer.webp');
