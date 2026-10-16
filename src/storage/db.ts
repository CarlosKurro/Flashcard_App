import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Deck, Flashcard } from '../types';

export interface KanjiFlashcardDBSchema extends DBSchema {
  decks: {
    key: string;
    value: Deck;
    indexes: { 'by-updated': number };
  };
  cards: {
    key: string;
    value: Flashcard;
    indexes: {
      'by-deck': string;
      'by-status': string;
      'by-kanji': string;
      'by-deck-kanji': [string, string];
    };
  };
}

const DB_NAME = 'kanji_flashcards_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KanjiFlashcardDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<KanjiFlashcardDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<KanjiFlashcardDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, _transaction) {
        if (oldVersion < 1) {
          // Decks store
          const deckStore = db.createObjectStore('decks', { keyPath: 'id' });
          deckStore.createIndex('by-updated', 'updatedAt');

          // Cards store
          const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
          cardStore.createIndex('by-deck', 'deckId');
          cardStore.createIndex('by-status', 'status');
          cardStore.createIndex('by-kanji', 'kanji');
          cardStore.createIndex('by-deck-kanji', ['deckId', 'kanji']);
        }
      },
    });
  }
  return dbPromise;
}
