import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(__dirname, '../favicon.ico');

// Generate 32x32 32-bit RGBA Icon for Windows/Browsers
const width = 32;
const height = 32;

// Draw a geometric crimson/red tiger crest on black/transparent background
const pixels = new Uint8Array(width * height * 4); // BGRA

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  // ICO BMP stores bottom-to-top, but we can do normal y if we invert in write
  const idx = (y * width + x) * 4;
  pixels[idx + 0] = b;
  pixels[idx + 1] = g;
  pixels[idx + 2] = r;
  pixels[idx + 3] = a;
}

// Draw a stylized geometric crimson tiger face (similar to tiger-logo.svg)
// Dark background with crimson red outline & glowing features
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const cx = x - 15.5;
    const cy = y - 15.5;
    const dist = Math.sqrt(cx * cx + cy * cy);

    // Subtle dark circular badge
    if (dist <= 15) {
      setPixel(x, y, 10, 12, 16, 255); // near black #0a0c10
    }
  }
}

// Draw red geometric lines/polygons
function drawLine(x0, y0, x1, y1, r, g, b, a) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0;
  let cy = y0;
  while (true) {
    setPixel(cx, cy, r, g, b, a);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

// Crimson red #ff2a3a
const R = 255, G = 42, B = 58, A = 255;

// Outer shield/tiger contour
drawLine(16, 5, 22, 10, R, G, B, A);
drawLine(22, 10, 27, 7, R, G, B, A);
drawLine(27, 7, 25, 15, R, G, B, A);
drawLine(25, 15, 29, 18, R, G, B, A);
drawLine(29, 18, 25, 23, R, G, B, A);
drawLine(25, 23, 26, 28, R, G, B, A);
drawLine(26, 28, 16, 25, R, G, B, A);

drawLine(16, 5, 10, 10, R, G, B, A);
drawLine(10, 10, 5, 7, R, G, B, A);
drawLine(5, 7, 7, 15, R, G, B, A);
drawLine(7, 15, 3, 18, R, G, B, A);
drawLine(3, 18, 7, 23, R, G, B, A);
drawLine(7, 23, 6, 28, R, G, B, A);
drawLine(6, 28, 16, 25, R, G, B, A);

// Forehead stripes
drawLine(16, 8, 16, 13, R, G, B, A);
drawLine(13, 10, 19, 10, R, G, B, A);
drawLine(14, 12, 18, 12, R, G, B, A);

// Eyes
setPixel(11, 15, R, G, B, A);
setPixel(12, 15, R, G, B, A);
setPixel(12, 16, R, G, B, A);

setPixel(20, 15, R, G, B, A);
setPixel(19, 15, R, G, B, A);
setPixel(19, 16, R, G, B, A);

// Nose
setPixel(16, 19, R, G, B, A);
drawLine(15, 21, 17, 21, R, G, B, A);
drawLine(16, 21, 16, 23, R, G, B, A);

// Whiskers
drawLine(9, 18, 5, 19, R, G, B, A);
drawLine(9, 21, 6, 23, R, G, B, A);
drawLine(23, 18, 27, 19, R, G, B, A);
drawLine(23, 21, 26, 23, R, G, B, A);

// Assemble ICO buffer
const headerSize = 6;
const dirEntrySize = 16;
const bihSize = 40;
const xorSize = width * height * 4;
const andRowSize = Math.floor((width + 31) / 32) * 4; // 4 bytes per row
const andSize = andRowSize * height;
const imageSize = bihSize + xorSize + andSize;
const totalSize = headerSize + dirEntrySize + imageSize;

const buffer = Buffer.alloc(totalSize);

// Header
buffer.writeUInt16LE(0, 0); // Reserved
buffer.writeUInt16LE(1, 2); // 1 = ICO
buffer.writeUInt16LE(1, 4); // 1 image

// Directory Entry
buffer.writeUInt8(width, 6);
buffer.writeUInt8(height, 7);
buffer.writeUInt8(0, 8); // color count
buffer.writeUInt8(0, 9); // reserved
buffer.writeUInt16LE(1, 10); // color planes
buffer.writeUInt16LE(32, 12); // bits per pixel
buffer.writeUInt32LE(imageSize, 14); // image data size
buffer.writeUInt32LE(headerSize + dirEntrySize, 18); // offset

// BITMAPINFOHEADER
let offset = headerSize + dirEntrySize;
buffer.writeUInt32LE(bihSize, offset);
buffer.writeInt32LE(width, offset + 4);
buffer.writeInt32LE(height * 2, offset + 8); // Height*2 for ICO
buffer.writeUInt16LE(1, offset + 12); // Planes
buffer.writeUInt16LE(32, offset + 14); // BPP
buffer.writeUInt32LE(0, offset + 16); // BI_RGB (no compression)
buffer.writeUInt32LE(xorSize + andSize, offset + 20); // Image size
buffer.writeInt32LE(0, offset + 24); // XPelsPerMeter
buffer.writeInt32LE(0, offset + 28); // YPelsPerMeter
buffer.writeUInt32LE(0, offset + 32); // ClrUsed
buffer.writeUInt32LE(0, offset + 36); // ClrImportant
offset += bihSize;

// Write XOR mask (bottom to top, BGRA)
for (let y = height - 1; y >= 0; y--) {
  for (let x = 0; x < width; x++) {
    const srcIdx = (y * width + x) * 4;
    buffer[offset++] = pixels[srcIdx + 0]; // B
    buffer[offset++] = pixels[srcIdx + 1]; // G
    buffer[offset++] = pixels[srcIdx + 2]; // R
    buffer[offset++] = pixels[srcIdx + 3]; // A
  }
}

// Write AND mask (1 bit per pixel: 0 for opaque, 1 for transparent)
for (let y = height - 1; y >= 0; y--) {
  let maskByte = 0;
  for (let x = 0; x < width; x++) {
    const srcIdx = (y * width + x) * 4;
    const isTrans = pixels[srcIdx + 3] === 0 ? 1 : 0;
    maskByte |= (isTrans << (7 - (x % 8)));
    if ((x % 8) === 7 || x === width - 1) {
      buffer[offset++] = maskByte;
      maskByte = 0;
    }
  }
  // Row padding to 4-byte boundary
  const written = Math.ceil(width / 8);
  for (let p = written; p < andRowSize; p++) {
    buffer[offset++] = 0;
  }
}

fs.writeFileSync(outputFile, buffer);
console.log('Generated pixel-perfect favicon.ico at:', outputFile, 'size:', buffer.length);
