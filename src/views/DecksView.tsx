import React, { useState } from 'react';
import { Deck } from '../types';
import { DeckCard } from '../components/DeckCard';
import { saveDeck, deleteDeck } from '../storage/storageService';
import { Plus, FolderPlus, Layers, CheckCircle2, Bookmark } from 'lucide-react';

interface DecksViewProps {
  decks: Deck[];
  onRefreshDecks: () => Promise<void>;
  onStudyDeck: (deckId: string) => void;
  onNavigateToInput: () => void;
}

export const DecksView: React.FC<DecksViewProps> = ({
  decks,
  onRefreshDecks,
  onStudyDeck,
  onNavigateToInput,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Overall statistics
  const totalCards = decks.reduce((acc, d) => acc + (d.cardsCount || 0), 0);
  const totalMemorized = decks.reduce((acc, d) => acc + (d.memorizedCount || 0), 0);
  const overallPercent = totalCards > 0 ? Math.round((totalMemorized / totalCards) * 100) : 0;

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const now = Date.now();
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name: newDeckName.trim(),
      description: newDeckDesc.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await saveDeck(newDeck);
    await onRefreshDecks();
    setNewDeckName('');
    setNewDeckDesc('');
    setIsCreateModalOpen(false);
  };

  const handleStartEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setEditName(deck.name);
    setEditDesc(deck.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck || !editName.trim()) return;

    await saveDeck({
      ...editingDeck,
      name: editName.trim(),
      description: editDesc.trim(),
    });
    await onRefreshDecks();
    setEditingDeck(null);
  };

  const handleDeleteDeck = async (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa bộ thẻ "${deck.name}" và toàn bộ thẻ bên trong?`)) {
      await deleteDeck(deckId);
      await onRefreshDecks();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng số bộ thẻ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{decks.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(14, 165, 233, 0.15)',
            color: 'var(--color-info)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bookmark size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng số thẻ từ vựng</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCards}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mức độ ghi nhớ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {totalMemorized} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>({overallPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Title and Create Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Các bộ thẻ của bạn</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Quản lý và ôn tập từ vựng mọi lúc mọi nơi kể cả khi mất mạng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <FolderPlus size={17} />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--accent-gradient-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Layers size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Bạn chưa có bộ thẻ nào</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Bắt đầu bằng cách nhập ảnh bảng từ vựng hoặc tra cứu từ đơn tiếng Nhật để tạo bộ flashcard đầu tiên.
          </p>
          <button onClick={onNavigateToInput} className="btn btn-primary">
            <Plus size={17} />
            <span>Tạo thẻ từ ảnh hoặc từ điển ngay</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {decks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onStudy={onStudyDeck}
              onEdit={handleStartEdit}
              onDelete={handleDeleteDeck}
            />
          ))}
        </div>
      )}

      {/* Create Deck Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem',
        }}>
          <form
            onSubmit={handleCreateDeck}
            className="glass-panel animate-fade-in"
            style={{ maxWidth: 440, width: '100%', padding: '1.75rem', background: '#111827', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <h3 style={{ fontSize: '1.2rem' }}>Tạo bộ flashcard mới</h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tên bộ thẻ *
              </label>
              <input
                type="text"
                className="input"
                required
                autoFocus
                placeholder="VD: Từ vựng Minna no Nihongo Bài 1..."
                value={newDeckName}
                onChange={e => setNewDeckName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Mô tả (tùy chọn)
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="VD: Tổng hợp các tính từ và động từ N5 thường gặp..."
                value={newDeckDesc}
                onChange={e => setNewDeckDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Tạo bộ thẻ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Deck Modal */}
      {editingDeck && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '1rem',
        }}>
          <form
            onSubmit={handleSaveEdit}
            className="glass-panel animate-fade-in"
            style={{ maxWidth: 440, width: '100%', padding: '1.75rem', background: '#111827', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <h3 style={{ fontSize: '1.2rem' }}>Đổi tên bộ thẻ</h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Tên bộ thẻ *
              </label>
              <input
                type="text"
                className="input"
                required
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Mô tả
              </label>
              <textarea
                className="textarea"
                rows={3}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditingDeck(null)}
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
