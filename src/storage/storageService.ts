import { getDB } from './db';
import { Deck, Flashcard, BackupData, MemorizationStatus } from '../types';

export const INITIAL_SAMPLE_CARDS = [
  { kanji: '白い', reading: 'しろい', meaning: 'trắng' },
  { kanji: '涼しい', reading: 'すずしい', meaning: 'mát mẻ (ảnh ghi: ấm áp)' },
  { kanji: '正しい', reading: 'ただしい', meaning: 'chính xác' },
  { kanji: '楽しい', reading: 'たのしい', meaning: 'vui vẻ' },
  { kanji: '近い', reading: 'ちかい', meaning: 'gần' },
  { kanji: '都合がいい', reading: 'つごうがいい', meaning: 'thuận tiện' },
  { kanji: '強い', reading: 'つよい', meaning: 'mạnh mẽ' },
  { kanji: '低い', reading: 'ひくい', meaning: 'thấp (ảnh ghi: nhẹ)' },
  { kanji: '広い', reading: 'ひろい', meaning: 'rộng' },
  { kanji: '太い', reading: 'ふとい', meaning: 'mập' },
  { kanji: '細い', reading: 'ほそい', meaning: 'mỏng' },
  { kanji: '短い', reading: 'みじかい', meaning: 'ngắn' },
  { kanji: '良い', reading: 'よい', meaning: 'tốt' },
  { kanji: '弱い', reading: 'よわい', meaning: 'yếu' },
  { kanji: '悪い', reading: 'わるい', meaning: 'xấu' },
];

export async function initializeDatabaseIfNeeded(): Promise<void> {
  const db = await getDB();
  const count = await db.count('decks');
  if (count === 0) {
    const defaultDeckId = 'deck_sample_adj';
    const now = Date.now();
    const defaultDeck: Deck = {
      id: defaultDeckId,
      name: 'Từ vựng mẫu N5 (15 Tính từ & Cụm từ)',
      description: 'Bộ thẻ mẫu đối chiếu từ ảnh tham chiếu, bao gồm các từ tính từ N5 và cụm từ 都合がいい.',
      createdAt: now,
      updatedAt: now,
    };

    await db.put('decks', defaultDeck);

    const tx = db.transaction('cards', 'readwrite');
    for (let i = 0; i < INITIAL_SAMPLE_CARDS.length; i++) {
      const item = INITIAL_SAMPLE_CARDS[i];
      const card: Flashcard = {
        id: `card_sample_${i + 1}`,
        deckId: defaultDeckId,
        kanji: item.kanji,
        reading: item.reading,
        meaning: item.meaning,
        status: 'not_memorized',
        reviewCount: 0,
        createdAt: now + i,
        updatedAt: now + i,
        originalSource: {
          type: 'ocr',
          rawKanji: item.kanji,
          rawReading: item.reading,
          rawMeaning: item.meaning,
        },
      };
      await tx.store.put(card);
    }
    await tx.done;
  }
}

export async function getAllDecks(): Promise<Deck[]> {
  await initializeDatabaseIfNeeded();
  const db = await getDB();
  const decks = await db.getAll('decks');
  const allCards = await db.getAll('cards');

  // Compute counts for each deck
  const deckStats = new Map<string, { total: number; memorized: number }>();
  for (const card of allCards) {
    const stats = deckStats.get(card.deckId) || { total: 0, memorized: 0 };
    stats.total++;
    if (card.status === 'memorized') {
      stats.memorized++;
    }
    deckStats.set(card.deckId, stats);
  }

  return decks.map(d => ({
    ...d,
    cardsCount: deckStats.get(d.id)?.total || 0,
    memorizedCount: deckStats.get(d.id)?.memorized || 0,
  })).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const db = await getDB();
  return db.get('decks', id);
}

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await getDB();
  deck.updatedAt = Date.now();
  await db.put('decks', deck);
}

export async function deleteDeck(deckId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['decks', 'cards'], 'readwrite');
  await tx.objectStore('decks').delete(deckId);

  // Delete all cards in deck
  const cardIndex = tx.objectStore('cards').index('by-deck');
  let cursor = await cardIndex.openCursor(deckId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function getCardsByDeck(deckId: string): Promise<Flashcard[]> {
  const db = await getDB();
  const index = db.transaction('cards').store.index('by-deck');
  return index.getAll(deckId);
}

export async function saveCard(card: Flashcard): Promise<void> {
  const db = await getDB();
  card.updatedAt = Date.now();
  await db.put('cards', card);

  // Update deck's updatedAt
  const deck = await db.get('decks', card.deckId);
  if (deck) {
    deck.updatedAt = Date.now();
    await db.put('decks', deck);
  }
}

export async function deleteCard(cardId: string): Promise<void> {
  const db = await getDB();
  const card = await db.get('cards', cardId);
  if (card) {
    await db.delete('cards', cardId);
    const deck = await db.get('decks', card.deckId);
    if (deck) {
      deck.updatedAt = Date.now();
      await db.put('decks', deck);
    }
  }
}

export async function updateCardStatus(cardId: string, status: MemorizationStatus): Promise<void> {
  const db = await getDB();
  const card = await db.get('cards', cardId);
  if (card) {
    card.status = status;
    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewedAt = Date.now();
    card.updatedAt = Date.now();
    await db.put('cards', card);
  }
}

export type DuplicateStrategy = 'skip' | 'overwrite' | 'add_anyway';

export interface BulkAddResult {
  added: number;
  skipped: number;
  overwritten: number;
}

export async function bulkAddCards(
  deckId: string,
  newCards: Array<{
    kanji: string;
    reading: string;
    meaning: string;
    notes?: string;
    rawKanji?: string;
    rawReading?: string;
    rawMeaning?: string;
    warning?: string;
    source: 'ocr' | 'dictionary' | 'manual';
  }>,
  strategy: DuplicateStrategy = 'add_anyway'
): Promise<BulkAddResult> {
  const db = await getDB();
  const existingCards = await getCardsByDeck(deckId);
  const existingMap = new Map<string, Flashcard>();
  for (const c of existingCards) {
    existingMap.set(c.kanji.trim(), c);
  }

  let added = 0;
  let skipped = 0;
  let overwritten = 0;
  const now = Date.now();
  const tx = db.transaction('cards', 'readwrite');

  for (let i = 0; i < newCards.length; i++) {
    const item = newCards[i];
    const kanjiKey = item.kanji.trim();
    if (!kanjiKey) continue;

    const existing = existingMap.get(kanjiKey);
    if (existing) {
      if (strategy === 'skip') {
        skipped++;
        continue;
      } else if (strategy === 'overwrite') {
        existing.reading = item.reading;
        existing.meaning = item.meaning;
        if (item.notes) existing.notes = item.notes;
        existing.updatedAt = now + i;
        await tx.store.put(existing);
        overwritten++;
        continue;
      }
    }

    const newCard: Flashcard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      deckId,
      kanji: item.kanji.trim(),
      reading: item.reading.trim(),
      meaning: item.meaning.trim(),
      notes: item.notes,
      status: 'not_memorized',
      reviewCount: 0,
      createdAt: now + i,
      updatedAt: now + i,
      originalSource: {
        type: item.source,
        rawKanji: item.rawKanji,
        rawReading: item.rawReading,
        rawMeaning: item.rawMeaning,
        warningNote: item.warning,
      },
    };
    await tx.store.put(newCard);
    added++;
  }

  await tx.done;

  // Touch deck updatedAt
  const deck = await db.get('decks', deckId);
  if (deck) {
    deck.updatedAt = Date.now();
    await db.put('decks', deck);
  }

  return { added, skipped, overwritten };
}

export async function exportBackup(): Promise<BackupData> {
  const db = await getDB();
  const decks = await db.getAll('decks');
  const cards = await db.getAll('cards');

  return {
    version: 1,
    appName: 'Kanji Flashcard PWA',
    exportedAt: new Date().toISOString(),
    decks,
    cards,
  };
}

export interface ImportResult {
  success: boolean;
  decksImported: number;
  cardsImported: number;
  error?: string;
}

export async function importBackup(jsonString: string): Promise<ImportResult> {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    if (!data || typeof data !== 'object') {
      return { success: false, decksImported: 0, cardsImported: 0, error: 'Tệp không phải là đối tượng JSON hợp lệ.' };
    }
    if (!Array.isArray(data.decks) || !Array.isArray(data.cards)) {
      return { success: false, decksImported: 0, cardsImported: 0, error: 'Định dạng dữ liệu không khớp schema (thiếu decks hoặc cards).' };
    }

    const db = await getDB();
    const tx = db.transaction(['decks', 'cards'], 'readwrite');

    let decksImported = 0;
    for (const d of data.decks) {
      if (d && d.id && d.name) {
        await tx.objectStore('decks').put({
          id: String(d.id),
          name: String(d.name),
          description: d.description ? String(d.description) : '',
          createdAt: Number(d.createdAt) || Date.now(),
          updatedAt: Number(d.updatedAt) || Date.now(),
        });
        decksImported++;
      }
    }

    let cardsImported = 0;
    for (const c of data.cards) {
      if (c && c.id && c.deckId && c.kanji) {
        await tx.objectStore('cards').put({
          id: String(c.id),
          deckId: String(c.deckId),
          kanji: String(c.kanji),
          reading: c.reading ? String(c.reading) : '',
          meaning: c.meaning ? String(c.meaning) : '',
          notes: c.notes ? String(c.notes) : undefined,
          status: c.status === 'memorized' ? 'memorized' : 'not_memorized',
          reviewCount: Number(c.reviewCount) || 0,
          lastReviewedAt: c.lastReviewedAt ? Number(c.lastReviewedAt) : undefined,
          createdAt: Number(c.createdAt) || Date.now(),
          updatedAt: Number(c.updatedAt) || Date.now(),
          originalSource: c.originalSource,
        });
        cardsImported++;
      }
    }

    await tx.done;
    return { success: true, decksImported, cardsImported };
  } catch (err: any) {
    return { success: false, decksImported: 0, cardsImported: 0, error: `Lỗi đọc tệp JSON: ${err?.message || err}` };
  }
}
