import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

async function run() {
  console.log('Testing Tesseract.js on reference image...');
  const imagePath = path.resolve('local-data/reference_image.jpg');
  if (!fs.existsSync(imagePath)) {
    console.error('File not found:', imagePath);
    process.exit(1);
  }

  const startTime = Date.now();
  console.log('Initializing worker with jpn + vie...');
  const worker = await createWorker(['jpn', 'vie'], 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        process.stdout.write(`\rProgress: ${(m.progress * 100).toFixed(1)}%`);
      }
    }
  });

  console.log('\nRunning recognition...');
  const ret = await worker.recognize(imagePath);
  const duration = Date.now() - startTime;
  console.log(`\nCompleted in ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

  console.log('\n--- RAW TEXT OUTPUT ---');
  console.log(ret.data.text);

  console.log('\n--- LINE-BY-LINE ANALYSIS ---');
  ret.data.lines.forEach((line, idx) => {
    console.log(`[Line ${idx + 1}] (conf: ${line.confidence}): ${line.text.trim()}`);
  });

  await worker.terminate();
}

run().catch(err => {
  console.error('OCR Error:', err);
  process.exit(1);
});
