#!/usr/bin/env node
// Generates responsive variants for founder.jpeg using sharp
// Usage: node scripts/generate-responsive-images.js

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcDir = path.join(process.cwd(), 'src');
const input = path.join(srcDir, 'founder.jpeg');
if (!fs.existsSync(input)) {
  console.error('founder.jpeg not found in src/. Place the original image at src/founder.jpeg');
  process.exit(1);
}

const sizes = [440, 880, 1320];

async function generate() {
  for (const w of sizes) {
    const out = path.join(srcDir, `founder-${w}w.jpg`);
    try {
      await sharp(input).resize(w).jpeg({ quality: 82 }).toFile(out);
      console.log('Wrote', out);
    } catch (err) {
      console.error('Failed to write', out, err.message);
    }
  }
}

generate().then(() => console.log('Done')).catch((err) => { console.error(err); process.exit(1); });
