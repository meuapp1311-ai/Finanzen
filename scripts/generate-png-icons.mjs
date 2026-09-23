import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple valid PNG builder using raw scanlines and zlib
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }

  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makePngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

function createIconPng(width, height, isMaskable = false) {
  const bytesPerPixel = 4; // RGBA
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (Math.min(width, height) / 2) * (isMaskable ? 0.95 : 0.88);
  const cornerR = outerR * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #090d16 with slight gradient
      const gradFactor = (y / height);
      let r = Math.round(9 + gradFactor * 4);
      let g = Math.round(13 + gradFactor * 10);
      let b = Math.round(22 + gradFactor * 20);
      let a = 255;

      // Inner wallet icon bounds
      const scale = width / 512;
      const wL = cx - 140 * scale;
      const wR = cx + 140 * scale;
      const wT = cy - 100 * scale;
      const wB = cy + 100 * scale;

      // Wallet body
      if (x >= wL && x <= wR && y >= wT && y <= wB) {
        // Emerald gradient: #10b981 to #059669
        const wY = (y - wT) / (wB - wT);
        r = Math.round(16 * (1 - wY) + 5 * wY);
        g = Math.round(185 * (1 - wY) + 150 * wY);
        b = Math.round(129 * (1 - wY) + 105 * wY);

        // Zen coin badge inside wallet
        const cL = cx + 5 * scale;
        const cR = cx + 140 * scale;
        const cT = cy - 35 * scale;
        const cB = cy + 35 * scale;
        if (x >= cL && x <= cR && y >= cT && y <= cB) {
          r = 9; g = 13; b = 22; // dark badge
          const coinDist = Math.sqrt(Math.pow(x - (cx + 72 * scale), 2) + Math.pow(y - cy, 2));
          if (coinDist <= 16 * scale) {
            r = 52; g = 211; b = 153; // mint coin center
          }
        }
      }

      // Outer squircle or maskable border
      if (!isMaskable) {
        // Check rounded rect clip
        const qx = Math.max(Math.abs(dx) - (cx - cornerR), 0);
        const qy = Math.max(Math.abs(dy) - (cy - cornerR), 0);
        if (Math.sqrt(qx * qx + qy * qy) > cornerR) {
          a = 0; // transparent outside rounded rect
          r = 0; g = 0; b = 0;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makePngChunk('IHDR', ihdr);
  const idatChunk = makePngChunk('IDAT', zlib.deflateSync(rawData, { level: 9 }));
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const pwa192 = createIconPng(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// Generate 512x512
const pwa512 = createIconPng(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Generate 512x512 Maskable (full bleed safe zone)
const pwaMaskable512 = createIconPng(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);

// Generate apple-touch-icon 180x180 (iOS Safari requires PNG)
const appleIcon = createIconPng(180, 180, true);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Generate favicon (32x32 PNG used as favicon)
const favicon = createIconPng(32, 32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated all PWA icons: 192x192, 512x512, maskable 512x512, apple-touch-icon.png, and favicon.ico');
