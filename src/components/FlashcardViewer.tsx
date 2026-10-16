import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, MemorizationStatus } from '../types';
import { RotateCw, Check, X, ArrowLeft, ArrowRight, Award, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardViewerProps {
  deckName: string;
  cards: Flashcard[];
  onUpdateStatus: (cardId: string, status: MemorizationStatus) => Promise<void>;
  onClose: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  deckName,
  cards,
  onUpdateStatus,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>(cards);
  const [unmemorizedIds, setUnmemorizedIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = sessionCards[currentIndex];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback if canvas not available
    }
  };

  const handleRate = useCallback(async (status: MemorizationStatus) => {
    if (!currentCard) return;

    await onUpdateStatus(currentCard.id, status);

    if (status === 'not_memorized') {
      setUnmemorizedIds(prev => new Set(prev).add(currentCard.id));
    }

    setIsFlipped(false);

    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      triggerConfetti();
    }
  }, [currentCard, currentIndex, sessionCards.length, onUpdateStatus]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleRate('not_memorized');
      } else if (e.key === '2' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleRate('memorized');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isCompleted]);

  const handleRestartAll = () => {
    setSessionCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setUnmemorizedIds(new Set());
    setIsCompleted(false);
  };

  const handleRestartUnmemorizedOnly = () => {
    const filtered = cards.filter(c => unmemorizedIds.has(c.id));
    if (filtered.length === 0) {
      handleRestartAll();
      return;
    }
    setSessionCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setUnmemorizedIds(new Set());
    setIsCompleted(false);
  };

  if (cards.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h3>Bộ thẻ này chưa có thẻ nào</h3>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          Vui lòng chuyển qua mục "Nhập liệu" để thêm từ vựng vào bộ thẻ này.
        </p>
        <button onClick={onClose} className="btn btn-primary">Quay lại danh sách</button>
      </div>
    );
  }

  if (isCompleted) {
    const totalReviewed = sessionCards.length;
    const needReviewCount = unmemorizedIds.size;
    const rememberedCount = totalReviewed - needReviewCount;
    const successRate = Math.round((rememberedCount / totalReviewed) * 100);

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--accent-gradient-subtle)',
          color: 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Award size={44} />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Hoàn thành buổi học!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Bạn đã hoàn thành phiên ôn tập bộ thẻ: <strong>{deckName}</strong>
        </p>

        {/* Score card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đã ghi nhớ</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {rememberedCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cần ôn lại</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: needReviewCount > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
              {needReviewCount}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {needReviewCount > 0 && (
            <button
              onClick={handleRestartUnmemorizedOnly}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <RefreshCcw size={18} />
              <span>Chỉ ôn lại {needReviewCount} thẻ chưa nhớ</span>
            </button>
          )}

          <button
            onClick={handleRestartAll}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            <RotateCw size={18} />
            <span>Ôn tập lại từ đầu (tất cả {cards.length} thẻ)</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            <span>Quay lại danh sách bộ thẻ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      {/* Top Session Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} />
          <span>Thoát</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {deckName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Thẻ {currentIndex + 1} / {sessionCards.length}
          </div>
        </div>

        <div className="badge badge-primary">
          {Math.round(((currentIndex) / sessionCards.length) * 100)}%
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <div className="flashcard-scene" onClick={handleFlip}>
        <div className={`flashcard-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Face: Kanji */}
          <div className="flashcard-face flashcard-front">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-primary">Mặt trước</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bấm để xem cách đọc & nghĩa</span>
            </div>

            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <div
                className="font-jp"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                  textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
              >
                {currentCard.kanji}
              </div>

              {currentCard.notes && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  {currentCard.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RotateCw size={14} />
              <span>Chạm thẻ hoặc phím Space để lật</span>
            </div>
          </div>

          {/* Back Face: Hiragana & Meaning */}
          <div className="flashcard-face flashcard-back">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-success">Mặt sau</span>
              <span className="font-jp" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {currentCard.kanji}
              </span>
            </div>

            <div style={{ textAlign: 'center', margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Reading in Hiragana */}
              <div
                className="font-jp"
                style={{
                  fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#a5b4fc',
                }}
              >
                {currentCard.reading}
              </div>

              {/* Vietnamese Meaning */}
              <div
                style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.85rem)',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: 1.4,
                }}
              >
                {currentCard.meaning}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <span>Đánh giá mức nhớ ở bên dưới</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control rating buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => handleRate('not_memorized')}
          className="btn btn-danger"
          style={{ padding: '0.9rem', fontSize: '1rem' }}
          title="Phím tắt: 1 hoặc Mũi tên trái"
        >
          <X size={20} />
          <span>Chưa nhớ (1)</span>
        </button>

        <button
          onClick={() => handleRate('memorized')}
          className="btn btn-success"
          style={{ padding: '0.9rem', fontSize: '1rem' }}
          title="Phím tắt: 2 hoặc Mũi tên phải"
        >
          <Check size={20} />
          <span>Đã nhớ (2)</span>
        </button>
      </div>

      {/* Desktop keyboard hint */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="hide-on-mobile">
        Phím tắt: <strong>Space</strong> (lật thẻ) • <strong>1</strong> (chưa nhớ) • <strong>2</strong> (đã nhớ)
      </div>
    </div>
  );
};
