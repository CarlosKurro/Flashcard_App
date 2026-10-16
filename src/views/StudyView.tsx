import React, { useState, useEffect } from 'react';
import { Flashcard, Deck, MemorizationStatus } from '../types';
import { getDeck, getCardsByDeck, updateCardStatus } from '../storage/storageService';
import { FlashcardViewer } from '../components/FlashcardViewer';

interface StudyViewProps {
  deckId: string;
  onExit: () => void;
  onCardsUpdated: () => Promise<void>;
}

export const StudyView: React.FC<StudyViewProps> = ({ deckId, onExit, onCardsUpdated }) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [d, c] = await Promise.all([
          getDeck(deckId),
          getCardsByDeck(deckId),
        ]);
        if (active) {
          setDeck(d || null);
          setCards(c);
        }
      } catch (err) {
        console.error('Failed to load study session data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [deckId]);

  const handleUpdateStatus = async (cardId: string, status: MemorizationStatus) => {
    await updateCardStatus(cardId, status);
    // Update local card state
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status } : c));
    await onCardsUpdated();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        Đang nạp các thẻ flashcard...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <FlashcardViewer
        deckName={deck?.name || 'Bộ flashcard'}
        cards={cards}
        onUpdateStatus={handleUpdateStatus}
        onClose={onExit}
      />
    </div>
  );
};
