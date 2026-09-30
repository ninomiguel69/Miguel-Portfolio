import fs from 'fs';

function getJpegDimensions(buffer) {
  let i = 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) break;
    const marker = buffer[i + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buffer.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

function getWebpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    // Lossy VP8
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { chunk, width, height };
  } else if (chunk === 'VP8L') {
    // Lossless VP8L
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    const width = 1 + (((b1 & 0x3F) << 8) | b0);
    const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
    return { chunk, width, height };
  } else if (chunk === 'VP8X') {
    // Extended VP8X
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { chunk, width, height };
  }
  return { chunk };
}

const jpgBuf = fs.readFileSync('frames/ezgif-frame-001.jpg');
console.log('ezgif-frame-001.jpg:', getJpegDimensions(jpgBuf));

const webpBuf = fs.readFileSync('frames/frame-001.webp');
console.log('frame-001.webp:', getWebpDimensions(webpBuf));
