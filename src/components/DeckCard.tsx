import React from 'react';
import { Deck } from '../types';
import { Play, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onStudy: (deckId: string) => void;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onStudy, onEdit, onDelete }) => {
  const total = deck.cardsCount || 0;
  const memorized = deck.memorizedCount || 0;
  const percent = total > 0 ? Math.round((memorized / total) * 100) : 0;

  return (
    <div className="glass-panel" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top section: Title, description, card count */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {deck.name}
          </h3>
          <span className="badge badge-primary" style={{ whiteSpace: 'nowrap' }}>
            {total} thẻ
          </span>
        </div>

        {deck.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineClamp: 2 }}>
            {deck.description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
              Đã thuộc: {memorized}/{total}
            </span>
            <span style={{ fontWeight: 700, color: percent === 100 ? 'var(--color-success)' : 'var(--accent-primary)' }}>
              {percent}%
            </span>
          </div>

          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percent}%`,
              height: '100%',
              background: percent === 100
                ? 'var(--color-success)'
                : 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onStudy(deck.id)}
          disabled={total === 0}
          className="btn btn-primary"
          style={{ flex: 1, marginRight: '0.5rem' }}
        >
          <Play size={16} fill="currentColor" />
          <span>Học ngay</span>
        </button>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => onEdit(deck)}
            className="btn btn-ghost"
            title="Đổi tên bộ thẻ"
            style={{ padding: '0.5rem' }}
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(deck.id)}
            className="btn btn-ghost"
            title="Xóa bộ thẻ"
            style={{ padding: '0.5rem', color: 'var(--color-danger)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
