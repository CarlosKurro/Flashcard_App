import { createWorker } from 'tesseract.js';
import path from 'path';

async function testCombined() {
  const imagePath = path.resolve('local-data/reference_image.jpg');
  console.log('Running combined 2-pass recognition (jpn for Col 1-2, vie for Col 3)...');

  const startTime = Date.now();
  const workerJpn = await createWorker('jpn');
  const workerVie = await createWorker('vie');

  const [retJpn, retVie] = await Promise.all([
    workerJpn.recognize(imagePath),
    workerVie.recognize(imagePath)
  ]);

  const elapsed = Date.now() - startTime;
  console.log(`Both passes finished in ${elapsed}ms`);

  // Extract Japanese lines
  const jpnLines = retJpn.data.lines.map(line => {
    // words with x < 200 are kanji/compound
    const kanjiWords = line.words.filter(w => w.bbox.x0 < 200);
    // words with 200 <= x < 400 are reading
    const readingWords = line.words.filter(w => w.bbox.x0 >= 200 && w.bbox.x0 < 400);

    const kanji = kanjiWords.map(w => w.text).join('').replace(/\s+/g, '');
    const reading = readingWords.map(w => w.text).join('').replace(/\s+/g, '');
    return {
      y0: line.bbox.y0,
      y1: line.bbox.y1,
      kanji,
      reading,
      confidence: line.confidence
    };
  });

  // Extract Vietnamese lines
  const vieLines = retVie.data.lines.map(line => {
    const vnWords = line.words.filter(w => w.bbox.x0 >= 380);
    const meaning = vnWords.map(w => w.text).join(' ').trim();
    return {
      y0: line.bbox.y0,
      y1: line.bbox.y1,
      meaning
    };
  }).filter(l => l.meaning.length > 0);

  console.log(`Detected ${jpnLines.length} Japanese lines and ${vieLines.length} Vietnamese lines.`);

  // Pair each jpn line with closest vie line by Y center
  const rows = jpnLines.map((jLine, idx) => {
    const jCenter = (jLine.y0 + jLine.y1) / 2;
    let closestVie = null;
    let minDiff = Infinity;
    for (const vLine of vieLines) {
      const vCenter = (vLine.y0 + vLine.y1) / 2;
      const diff = Math.abs(jCenter - vCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestVie = vLine;
      }
    }

    return {
      row: idx + 1,
      kanji: jLine.kanji,
      reading: jLine.reading,
      meaning: closestVie ? closestVie.meaning : '',
      confidence: jLine.confidence
    };
  });

  console.log('\n--- EXTRACTED 15 ROWS ---');
  console.table(rows);

  await workerJpn.terminate();
  await workerVie.terminate();
}

testCombined().catch(console.error);
