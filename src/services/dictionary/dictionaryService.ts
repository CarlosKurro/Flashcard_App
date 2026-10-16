import { DictionaryEntry, DictionaryService, LookupResult } from '../../types';
import { LOCAL_DICTIONARY_ENTRIES } from './localDict';

// In-memory cache for online lookups
const onlineCache = new Map<string, DictionaryEntry[]>();

export class HybridDictionaryService implements DictionaryService {
  /**
   * Search offline dictionary entries
   */
  lookupLocal(query: string): { exactMatches: DictionaryEntry[]; suggestions: DictionaryEntry[] } {
    const q = query.trim().toLowerCase();
    if (!q) return { exactMatches: [], suggestions: [] };

    const exactMatches: DictionaryEntry[] = [];
    const suggestions: DictionaryEntry[] = [];

    for (const entry of LOCAL_DICTIONARY_ENTRIES) {
      const matchKanji = entry.kanji.toLowerCase() === q;
      const matchReading = entry.reading.toLowerCase() === q;
      const matchRomaji = entry.romaji?.toLowerCase() === q;

      if (matchKanji || matchReading || matchRomaji) {
        exactMatches.push(entry);
      } else if (
        entry.kanji.toLowerCase().includes(q) ||
        entry.reading.toLowerCase().includes(q) ||
        entry.romaji?.toLowerCase().includes(q)
      ) {
        suggestions.push(entry);
      }
    }

    return { exactMatches, suggestions: suggestions.slice(0, 10) };
  }

  /**
   * Query Mazii open search API for Japanese-Vietnamese dictionary
   */
  async lookupOnline(query: string): Promise<DictionaryEntry[]> {
    const q = query.trim();
    if (!q) return [];

    if (onlineCache.has(q)) {
      return onlineCache.get(q)!;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch('https://mazii.net/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dict: 'javi',
          type: 'word',
          query: q,
          page: 1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json || !Array.isArray(json.data) || json.data.length === 0) {
        onlineCache.set(q, []);
        return [];
      }

      const entries: DictionaryEntry[] = [];

      for (const item of json.data.slice(0, 5)) {
        const word = item.word || q;
        const phonetic = (item.phonetic || '').trim();
        // Mazii phonetic can be multiple space-separated readings (e.g. "なま せい き")
        const readings = phonetic ? phonetic.split(/\s+/).filter(Boolean) : [word];

        // Parse Vietnamese meanings
        const senses: { meaningVi: string; partOfSpeech?: string[] }[] = [];
        if (item.means && Array.isArray(item.means) && item.means.length > 0) {
          for (const m of item.means) {
            const meanText = m.mean || m.explain;
            if (meanText) {
              senses.push({
                meaningVi: meanText.trim(),
                partOfSpeech: m.kind ? [m.kind] : undefined,
              });
            }
          }
        } else if (item.short_mean) {
          // Fallback to short_mean (often semicolon-separated)
          const parts = item.short_mean.split(';').map((s: string) => s.trim()).filter(Boolean);
          parts.slice(0, 4).forEach((part: string) => {
            senses.push({ meaningVi: part });
          });
        }

        if (senses.length === 0) {
          senses.push({ meaningVi: item.short_mean || 'Chưa có bản dịch chi tiết' });
        }

        // If multiple readings exist, create an entry for each primary reading
        for (const r of readings.slice(0, 3)) {
          entries.push({
            kanji: word,
            reading: r,
            senses,
            source: 'online_api',
          });
        }
      }

      onlineCache.set(q, entries);
      return entries;
    } catch (err) {
      console.warn('Online dictionary lookup failed, falling back to local:', err);
      return [];
    }
  }

  /**
   * Main lookup method: searches local first, then online if online available or if local is empty
   */
  async lookup(query: string): Promise<LookupResult> {
    const q = query.trim();
    if (!q) {
      return { query, exactMatches: [], suggestions: [], sourceInfo: 'Vui lòng nhập từ để tra cứu' };
    }

    const localResult = this.lookupLocal(q);

    // If local has exact matches, return them immediately
    if (localResult.exactMatches.length > 0) {
      return {
        query: q,
        exactMatches: localResult.exactMatches,
        suggestions: localResult.suggestions,
        sourceInfo: 'Nguồn: Từ điển Ngoại tuyến tích hợp sẵn (JMdict / JLPT N5-N3)',
      };
    }

    // Try online lookup if in browser and online, or in node/test environment
    const isBrowserOffline = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && window.navigator.onLine === false;
    if (isBrowserOffline) {
      return {
        query: q,
        exactMatches: [],
        suggestions: localResult.suggestions,
        sourceInfo: 'Bạn đang ngoại tuyến. Không tìm thấy trong từ điển nội bộ.',
      };
    }

    const onlineEntries = await this.lookupOnline(q);
    if (onlineEntries.length > 0) {
      // Split into exact matches and suggestions
      const exact = onlineEntries.filter(e => e.kanji === q || e.reading === q);
      const suggestions = onlineEntries.filter(e => e.kanji !== q && e.reading !== q);

      return {
        query: q,
        exactMatches: exact.length > 0 ? exact : onlineEntries,
        suggestions: [...localResult.suggestions, ...suggestions],
        sourceInfo: 'Nguồn: Mazii Open API (Trực tuyến)',
      };
    }

    return {
      query: q,
      exactMatches: [],
      suggestions: localResult.suggestions,
      sourceInfo: 'Không tìm thấy kết quả phù hợp. Bạn có thể tự nhập tay thông tin vào bảng bên dưới.',
    };
  }

  async getSuggestions(prefix: string): Promise<string[]> {
    const p = prefix.trim().toLowerCase();
    if (!p) return [];

    const suggestions = new Set<string>();
    for (const e of LOCAL_DICTIONARY_ENTRIES) {
      if (e.kanji.toLowerCase().startsWith(p)) suggestions.add(e.kanji);
      if (e.reading.toLowerCase().startsWith(p)) suggestions.add(e.reading);
      if (suggestions.size >= 8) break;
    }
    return Array.from(suggestions);
  }
}

export const dictionaryService = new HybridDictionaryService();
