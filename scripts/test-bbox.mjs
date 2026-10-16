import { createWorker } from 'tesseract.js';
import path from 'path';

async function run() {
  const imagePath = path.resolve('local-data/reference_image.jpg');
  const worker = await createWorker('jpn+vie');

  const ret = await worker.recognize(imagePath);
  console.log(`Image size: ${ret.data.image_width} x ${ret.data.image_height}`);
  console.log(`Total lines: ${ret.data.lines.length}`);

  ret.data.lines.forEach((line, lineIdx) => {
    console.log(`\n--- Line ${lineIdx + 1} (y0: ${line.bbox.y0}, y1: ${line.bbox.y1}) ---`);
    console.log(`Full line text: "${line.text.trim()}"`);
    console.log('Words count:', line.words.length);
    line.words.forEach(w => {
      console.log(`  Word: "${w.text}" [x: ${w.bbox.x0}-${w.bbox.x1}, y: ${w.bbox.y0}-${w.bbox.y1}] conf: ${w.confidence}`);
    });
  });

  await worker.terminate();
}

run().catch(console.error);
