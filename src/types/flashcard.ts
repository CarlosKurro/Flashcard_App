export type MemorizationStatus = 'not_memorized' | 'memorized';

export interface Flashcard {
  id: string;
  deckId: string;
  kanji: string;
  reading: string; // Hiragana
  meaning: string; // Vietnamese meaning
  originalSource?: {
    type: 'ocr' | 'dictionary' | 'manual';
    rawKanji?: string;
    rawReading?: string;
    rawMeaning?: string;
    warningNote?: string;
  };
  notes?: string;
  status: MemorizationStatus;
  reviewCount: number;
  lastReviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  cardsCount?: number;
  memorizedCount?: number;
}

export interface DraftTableRow {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  selected: boolean;
  rawKanji?: string;
  rawReading?: string;
  rawMeaning?: string;
  warning?: string;
  source: 'ocr' | 'dictionary' | 'manual';
}

export interface BackupData {
  version: number;
  exportedAt: string;
  appName: string;
  decks: Deck[];
  cards: Flashcard[];
}
