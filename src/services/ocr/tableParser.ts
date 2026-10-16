import { OcrTableCell, OcrTableRow } from '../../types';

export interface RawOcrLine {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

// Known discrepancies in reference material to flag for user review
const DICTIONARY_HINTS: Record<string, { expectedReading?: string; standardMeaning?: string }> = {
  '涼しい': { expectedReading: 'すずしい', standardMeaning: 'mát mẻ' },
  '低い': { expectedReading: 'ひくい', standardMeaning: 'thấp' },
  '強い': { expectedReading: 'つよい', standardMeaning: 'mạnh mẽ' },
  '広い': { expectedReading: 'ひろい', standardMeaning: 'rộng' },
  '都合がいい': { expectedReading: 'つごうがいい', standardMeaning: 'thuận tiện' },
};

export function parseTwoPassOcr(
  jpnLines: RawOcrLine[],
  vieLines: RawOcrLine[],
  imgWidth: number,
  imgHeight: number
): OcrTableRow[] {
  // Extract Japanese candidates:
  // Column 1: Kanji / Word (x < 35% of width or x < 200px)
  // Column 2: Hiragana reading (35% <= x < 65% of width or 200 <= x < 400px)
  const xCol1Boundary = imgWidth ? imgWidth * 0.35 : 200;
  const xCol2Boundary = imgWidth ? imgWidth * 0.65 : 400;

  const parsedJpn = jpnLines.map(line => {
    const kanjiWords = line.words.filter(w => w.bbox.x0 < xCol1Boundary);
    const readingWords = line.words.filter(w => w.bbox.x0 >= xCol1Boundary && w.bbox.x0 < xCol2Boundary);

    const kanjiText = kanjiWords.map(w => w.text).join('').replace(/\s+/g, '').replace(/[_—\-]/g, '');
    const readingText = readingWords.map(w => w.text).join('').replace(/\s+/g, '').replace(/[_—\-]/g, '');

    const avgKanjiConf = kanjiWords.length
      ? kanjiWords.reduce((acc, w) => acc + w.confidence, 0) / kanjiWords.length
      : line.confidence;

    const avgReadingConf = readingWords.length
      ? readingWords.reduce((acc, w) => acc + w.confidence, 0) / readingWords.length
      : line.confidence;

    return {
      y0: line.bbox.y0,
      y1: line.bbox.y1,
      yCenter: (line.bbox.y0 + line.bbox.y1) / 2,
      kanji: { text: kanjiText, confidence: Math.round(avgKanjiConf) },
      reading: { text: readingText, confidence: Math.round(avgReadingConf) },
      lineConfidence: line.confidence,
    };
  }).filter(item => item.kanji.text.length > 0 || item.reading.text.length > 0);

  // Extract Vietnamese candidates (x >= 60% of width or x >= 380px)
  const xCol3Boundary = imgWidth ? imgWidth * 0.60 : 380;
  const parsedVie = vieLines.map(line => {
    const vnWords = line.words.filter(w => w.bbox.x0 >= xCol3Boundary);
    const vnText = vnWords.map(w => w.text).join(' ').trim().replace(/^[_—\-]+/, '').trim();
    const avgVnConf = vnWords.length
      ? vnWords.reduce((acc, w) => acc + w.confidence, 0) / vnWords.length
      : line.confidence;

    return {
      y0: line.bbox.y0,
      y1: line.bbox.y1,
      yCenter: (line.bbox.y0 + line.bbox.y1) / 2,
      meaning: { text: vnText, confidence: Math.round(avgVnConf) },
    };
  }).filter(item => item.meaning.text.length > 0);

  // Match rows by closest Y Center
  const rows: OcrTableRow[] = parsedJpn.map((jLine, index) => {
    let closestVie: { meaning: OcrTableCell } | null = null;
    let minDiff = Infinity;

    for (const vLine of parsedVie) {
      const diff = Math.abs(jLine.yCenter - vLine.yCenter);
      if (diff < minDiff && diff < (imgHeight ? imgHeight * 0.1 : 80)) {
        minDiff = diff;
        closestVie = vLine;
      }
    }

    const kanjiText = jLine.kanji.text;
    const readingText = jLine.reading.text;
    const meaningText = closestVie ? closestVie.meaning.text : '';

    // Check for warnings or hints
    let warning: string | undefined = undefined;
    const hint = DICTIONARY_HINTS[kanjiText];
    if (hint) {
      if (hint.standardMeaning && meaningText && !meaningText.includes(hint.standardMeaning)) {
        warning = `Lưu ý: Nghĩa trong ảnh là "${meaningText}", nghĩa thông dụng là "${hint.standardMeaning}".`;
      } else if (jLine.reading.confidence < 75) {
        warning = `Độ tin cậy cách đọc thấp (${jLine.reading.confidence}%). Gợi ý: "${hint.expectedReading}".`;
      }
    } else if (jLine.kanji.confidence < 60 || jLine.reading.confidence < 60) {
      warning = 'Độ tin cậy nhận diện thấp. Vui lòng kiểm tra lại.';
    }

    return {
      id: `ocr_row_${index + 1}_${Date.now()}`,
      kanji: jLine.kanji,
      reading: jLine.reading,
      meaning: closestVie ? closestVie.meaning : { text: '', confidence: 0 },
      rawText: `${kanjiText} | ${readingText} | ${meaningText}`,
      warning,
    };
  });

  return rows;
}
