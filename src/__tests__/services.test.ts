import { describe, it, expect } from 'vitest';
import { dictionaryService } from '../services/dictionary/dictionaryService';
import { parseTwoPassOcr } from '../services/ocr/tableParser';

describe('Dictionary Service', () => {
  it('should find exact local matches for words in sample list', async () => {
    const res1 = await dictionaryService.lookup('白い');
    expect(res1.exactMatches.length).toBeGreaterThan(0);
    expect(res1.exactMatches[0].reading).toBe('しろい');
    expect(res1.exactMatches[0].senses[0].meaningVi).toContain('trắng');

    const res2 = await dictionaryService.lookup('都合がいい');
    expect(res2.exactMatches.length).toBeGreaterThan(0);
    expect(res2.exactMatches[0].reading).toBe('つごうがいい');
    expect(res2.exactMatches[0].senses[0].meaningVi).toContain('thuận tiện');
  });

  it('should handle multi-reading words like 生 correctly', async () => {
    const res = await dictionaryService.lookup('生');
    expect(res.exactMatches.length).toBeGreaterThanOrEqual(2);
    const readings = res.exactMatches.map(e => e.reading);
    expect(readings).toContain('なま');
    expect(readings).toContain('せい');
  });

  it('should handle non-existent words gracefully', async () => {
    const res = await dictionaryService.lookup('xyz123abc456notfound');
    expect(res.exactMatches.length).toBe(0);
    expect(res.sourceInfo).toContain('Không tìm thấy kết quả phù hợp');
  });
});

describe('OCR Table Parser', () => {
  it('should accurately align lines into 3-column table', () => {
    const mockJpnLines = [
      {
        text: '白い しろい',
        confidence: 95,
        bbox: { x0: 30, y0: 20, x1: 300, y1: 50 },
        words: [
          { text: '白い', confidence: 96, bbox: { x0: 30, y0: 20, x1: 80, y1: 50 } },
          { text: 'しろい', confidence: 94, bbox: { x0: 240, y0: 20, x1: 300, y1: 50 } },
        ],
      },
      {
        text: '涼しい すずしい',
        confidence: 90,
        bbox: { x0: 30, y0: 80, x1: 300, y1: 110 },
        words: [
          { text: '涼しい', confidence: 92, bbox: { x0: 30, y0: 80, x1: 90, y1: 110 } },
          { text: 'すずしい', confidence: 90, bbox: { x0: 240, y0: 80, x1: 300, y1: 110 } },
        ],
      },
    ];

    const mockVieLines = [
      {
        text: 'trắng',
        confidence: 92,
        bbox: { x0: 440, y0: 20, x1: 510, y1: 50 },
        words: [
          { text: 'trắng', confidence: 92, bbox: { x0: 440, y0: 20, x1: 510, y1: 50 } },
        ],
      },
      {
        text: 'ấm áp',
        confidence: 88,
        bbox: { x0: 440, y0: 80, x1: 510, y1: 110 },
        words: [
          { text: 'ấm áp', confidence: 88, bbox: { x0: 440, y0: 80, x1: 510, y1: 110 } },
        ],
      },
    ];

    const rows = parseTwoPassOcr(mockJpnLines, mockVieLines, 600, 1000);
    expect(rows.length).toBe(2);

    expect(rows[0].kanji.text).toBe('白い');
    expect(rows[0].reading.text).toBe('しろい');
    expect(rows[0].meaning.text).toBe('trắng');

    expect(rows[1].kanji.text).toBe('涼しい');
    expect(rows[1].reading.text).toBe('すずしい');
    expect(rows[1].meaning.text).toBe('ấm áp');
    // Notice that for 涼しい, a warning is raised regarding typical meaning vs raw OCR
    expect(rows[1].warning).toBeDefined();
    expect(rows[1].warning).toContain('mát mẻ');
  });
});
