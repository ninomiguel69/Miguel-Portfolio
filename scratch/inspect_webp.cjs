const fs = require('fs');

const buf = fs.readFileSync('assets/miguel-dancer.webp');
console.log('WebP size:', buf.length);

let offset = 12; // Skip RIFF header
let frameIdx = 0;
while (offset < buf.length) {
  const fourcc = buf.toString('ascii', offset, offset + 4);
  const size = buf.readUInt32LE(offset + 4);
  console.log(`Chunk: ${fourcc}, size: ${size} at offset ${offset}`);
  if (fourcc === 'ANIM') {
    const bgB = buf.readUInt8(offset + 8);
    const bgG = buf.readUInt8(offset + 9);
    const bgR = buf.readUInt8(offset + 10);
    const bgA = buf.readUInt8(offset + 11);
    const loop = buf.readUInt16LE(offset + 12);
    console.log(`  ANIM: BG=(R:${bgR}, G:${bgG}, B:${bgB}, A:${bgA}), loop: ${loop}`);
  }
  if (fourcc === 'ANMF') {
    const x = buf.readUIntLE(offset + 8, 3) * 2;
    const y = buf.readUIntLE(offset + 11, 3) * 2;
    const w = (buf.readUIntLE(offset + 14, 3) + 1);
    const h = (buf.readUIntLE(offset + 17, 3) + 1);
    const duration = buf.readUIntLE(offset + 20, 3);
    const flags = buf.readUInt8(offset + 23);
    const blend = (flags & 2) !== 0; // bit 1: 0 = blend, 1 = do not blend
    const dispose = (flags & 1) !== 0; // bit 0: 0 = do not dispose, 1 = dispose to background
    console.log(`  Frame ${frameIdx++}: (${x},${y}) ${w}x${h}, dur: ${duration}ms, flags byte: 0b${flags.toString(2).padStart(8, '0')}, dispose_to_bg: ${dispose}, no_blend: ${blend}`);
  }
  offset += 8 + size + (size % 2); // padded to even
}
