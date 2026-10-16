import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

// We can use a pure JS image crop or canvas/sharp/pngjs or check if Jimp or similar is available or use canvas
// But wait, can we pass rectangle to Tesseract.js?
// YES! Tesseract.js recognize() accepts an options object: { rectangle: { top, left, width, height } }!
// Let's verify this!

async function run() {
  const imagePath = path.resolve('local-data/reference_image.jpg');

  console.log('Testing Tesseract.js with `vie` worker and rectangle bounding box for Column 3...');
  const workerVie = await createWorker('vie');

  // Let's test recognizing the entire Column 3 (x from 410 to 650)
  // Let's see image dimensions first
  const retInfo = await workerVie.recognize(imagePath);
  console.log('Vietnamese full recognize lines:');
  retInfo.data.lines.forEach((l, i) => console.log(`Line ${i+1}: ${l.text.trim()}`));

  console.log('\n--- Testing with rectangle for Column 3 ---');
  // In the image, Column 3 is roughly left: 420, top: 0, width: 250, height: 1000
  const retCol3 = await workerVie.recognize(imagePath, {
    rectangle: { left: 420, top: 0, width: 260, height: 1000 }
  });

  console.log('Col 3 cropped result lines:');
  retCol3.data.lines.forEach((l, i) => console.log(`Col 3 line ${i+1}: "${l.text.trim()}" (conf: ${l.confidence})`));

  console.log('\n--- Testing Column 1 & 2 with `jpn` worker ---');
  const workerJpn = await createWorker('jpn');
  const retCol1 = await workerJpn.recognize(imagePath, {
    rectangle: { left: 0, top: 0, width: 220, height: 1000 }
  });
  console.log('Col 1 (Japanese):');
  retCol1.data.lines.forEach((l, i) => console.log(`Col 1 line ${i+1}: "${l.text.trim()}"`));

  const retCol2 = await workerJpn.recognize(imagePath, {
    rectangle: { left: 220, top: 0, width: 200, height: 1000 }
  });
  console.log('Col 2 (Hiragana):');
  retCol2.data.lines.forEach((l, i) => console.log(`Col 2 line ${i+1}: "${l.text.trim()}"`));

  await workerVie.terminate();
  await workerJpn.terminate();
}

run().catch(console.error);
