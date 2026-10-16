import { createWorker } from 'tesseract.js';
import path from 'path';

async function run() {
  const imagePath = path.resolve('local-data/reference_image.jpg');
  const workerVie = await createWorker('vie');
  const ret = await workerVie.recognize(imagePath);

  console.log('--- VIE WORDS WITH X > 400 ---');
  ret.data.lines.forEach((line, i) => {
    const vietnameseWords = line.words.filter(w => w.bbox.x0 >= 380);
    const vnText = vietnameseWords.map(w => w.text).join(' ');
    console.log(`Line ${i + 1} (y: ${line.bbox.y0}-${line.bbox.y1}): "${vnText}" (conf: ${line.confidence})`);
  });

  await workerVie.terminate();
}

run().catch(console.error);
