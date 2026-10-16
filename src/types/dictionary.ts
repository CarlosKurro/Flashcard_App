export interface DictionarySense {
  meaningVi: string;
  glossary?: string[];
  partOfSpeech?: string[];
  examples?: { ja: string; vi: string }[];
}

export interface DictionaryEntry {
  kanji: string;
  reading: string; // Hiragana
  senses: DictionarySense[];
  romaji?: string;
  jlptLevel?: string; // "N5", "N4", "N3", "N2", "N1"
  source: 'local' | 'online_api' | 'user_manual';
}

export interface LookupResult {
  query: string;
  exactMatches: DictionaryEntry[];
  suggestions: DictionaryEntry[];
  sourceInfo: string;
}

export interface DictionaryService {
  lookup(query: string): Promise<LookupResult>;
  getSuggestions(prefix: string): Promise<string[]>;
}
