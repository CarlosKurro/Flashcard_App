import { createWorker } from 'tesseract.js';
import path from 'path';

async function testPsm() {
  const imagePath = path.resolve('local-data/reference_image.jpg');
  console.log('Testing PSM modes and parameters on jpn...');

  const worker = await createWorker('jpn');
  // PSM 6: Assume a single uniform block of text
  // PSM 4: Assume a single column of text of variable sizes
  // PSM 11: Sparse text. Find as much text as possible in no particular order.
  for (const psm of [6, 4, 3]) {
    console.log(`\n--- Testing PSM ${psm} ---`);
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
    });
    const ret = await worker.recognize(imagePath);
    const lines = ret.data.lines.map(l => l.text.trim()).filter(Boolean);
    console.log(`Lines detected: ${lines.length}`);
    lines.slice(0, 15).forEach((l, i) => console.log(`  ${i+1}: ${l}`));
  }

  await worker.terminate();
}

testPsm().catch(console.error);
