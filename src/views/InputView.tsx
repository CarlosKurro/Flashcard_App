import React, { useState } from 'react';
import { DraftTableRow, Deck, OcrTableRow } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { WordLookup } from '../components/WordLookup';
import { TableEditor } from '../components/TableEditor';
import { bulkAddCards, saveDeck, DuplicateStrategy } from '../storage/storageService';
import { Image as ImageIcon, Search, CheckCircle } from 'lucide-react';

interface InputViewProps {
  decks: Deck[];
  onRefreshDecks: () => Promise<void>;
  onNavigateToStudy: (deckId: string) => void;
  onNavigateToDecks: () => void;
}

export const InputView: React.FC<InputViewProps> = ({
  decks,
  onRefreshDecks,
  onNavigateToStudy,
  onNavigateToDecks,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'word'>('image');
  const [draftRows, setDraftRows] = useState<DraftTableRow[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessInfo, setSavedSuccessInfo] = useState<{ count: number; deckId: string; deckName: string } | null>(null);

  // Update selectedDeckId if decks change and current selection is empty
  React.useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id);
    }
  }, [decks, selectedDeckId]);

  // Handler when OCR extracts rows from image
  const handleRowsExtracted = (ocrRows: OcrTableRow[]) => {
    const newDrafts: DraftTableRow[] = ocrRows.map(row => ({
      id: row.id,
      kanji: row.kanji.text,
      reading: row.reading.text,
      meaning: row.meaning.text,
      selected: true,
      rawKanji: row.kanji.text,
      rawReading: row.reading.text,
      rawMeaning: row.meaning.text,
      warning: row.warning,
      source: 'ocr',
    }));

    setDraftRows(prev => [...prev, ...newDrafts]);
    setSavedSuccessInfo(null);
  };

  // Handler when WordLookup adds a word
  const handleAddWordToTable = (kanji: string, reading: string, meaning: string, warning?: string) => {
    const newDraft: DraftTableRow = {
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      kanji,
      reading,
      meaning,
      selected: true,
      rawKanji: kanji,
      rawReading: reading,
      rawMeaning: meaning,
      warning,
      source: 'dictionary',
    };

    setDraftRows(prev => [newDraft, ...prev]);
    setSavedSuccessInfo(null);
  };

  const handleUpdateRow = (id: string, field: 'kanji' | 'reading' | 'meaning', value: string) => {
    setDraftRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteRow = (id: string) => {
    setDraftRows(prev => prev.filter(row => row.id !== id));
  };

  const handleAddEmptyRow = () => {
    const newRow: DraftTableRow = {
      id: `manual_${Date.now()}`,
      kanji: '',
      reading: '',
      meaning: '',
      selected: true,
      source: 'manual',
    };
    setDraftRows(prev => [...prev, newRow]);
  };

  const handleToggleSelect = (id: string) => {
    setDraftRows(prev =>
      prev.map(row => (row.id === id ? { ...row, selected: !row.selected } : row))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = draftRows.length > 0 && draftRows.every(r => r.selected);
    setDraftRows(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleSaveToDeck = async (
    targetDeckId: string,
    newDeckName?: string,
    strategy: DuplicateStrategy = 'add_anyway'
  ) => {
    setIsSaving(true);
    try {
      let finalDeckId = targetDeckId;
      let finalDeckName = '';

      if (targetDeckId === '__new__' && newDeckName) {
        finalDeckId = `deck_${Date.now()}`;
        finalDeckName = newDeckName;
        const now = Date.now();
        await saveDeck({
          id: finalDeckId,
          name: newDeckName,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const found = decks.find(d => d.id === targetDeckId);
        finalDeckName = found?.name || 'Bộ thẻ';
      }

      const selectedRows = draftRows.filter(r => r.selected);
      const cardsToSave = selectedRows.map(r => ({
        kanji: r.kanji,
        reading: r.reading,
        meaning: r.meaning,
        rawKanji: r.rawKanji,
        rawReading: r.rawReading,
        rawMeaning: r.rawMeaning,
        warning: r.warning,
        source: r.source,
      }));

      const result = await bulkAddCards(finalDeckId, cardsToSave, strategy);
      await onRefreshDecks();

      setSavedSuccessInfo({
        count: result.added + result.overwritten,
        deckId: finalDeckId,
        deckName: finalDeckName,
      });

      // Remove saved rows from draft
      setDraftRows(prev => prev.filter(r => !r.selected));
    } catch (err: any) {
      alert(`Lỗi khi lưu thẻ: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Sub Tabs for Input Methods */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('image')}
          className={`btn ${activeTab === 'image' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, maxWidth: 240 }}
        >
          <ImageIcon size={18} />
          <span>Nhập ảnh bảng (OCR)</span>
        </button>

        <button
          onClick={() => setActiveTab('word')}
          className={`btn ${activeTab === 'word' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, maxWidth: 240 }}
        >
          <Search size={18} />
          <span>Tra từ đơn tiếng Nhật</span>
        </button>
      </div>

      {/* Input component based on active tab */}
      {activeTab === 'image' ? (
        <ImageUploader onRowsExtracted={handleRowsExtracted} />
      ) : (
        <WordLookup onAddWordToTable={handleAddWordToTable} />
      )}

      {/* Success banner after saving */}
      {savedSuccessInfo && (
        <div style={{
          background: 'var(--color-success-bg)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          color: '#6ee7b7'
        }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={22} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Đã lưu thành công {savedSuccessInfo.count} thẻ vào bộ "{savedSuccessInfo.deckName}"!
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Dữ liệu đã được lưu trữ bền vững trong IndexedDB trên thiết bị của bạn.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onNavigateToStudy(savedSuccessInfo.deckId)}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Học ngay bộ này
            </button>
            <button
              onClick={onNavigateToDecks}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Xem danh sách bộ thẻ
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Table Editor */}
      <TableEditor
        rows={draftRows}
        decks={decks}
        selectedDeckId={selectedDeckId}
        onSelectDeck={setSelectedDeckId}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        onAddRow={handleAddEmptyRow}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onSaveToDeck={handleSaveToDeck}
        isSaving={isSaving}
      />
    </div>
  );
};
