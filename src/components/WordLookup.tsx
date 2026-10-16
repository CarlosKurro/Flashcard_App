import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, AlertCircle, Check, Info } from 'lucide-react';
import { dictionaryService } from '../services/dictionary/dictionaryService';
import { DictionaryEntry } from '../types';

interface WordLookupProps {
  onAddWordToTable: (kanji: string, reading: string, meaning: string, warning?: string) => void;
}

export const WordLookup: React.FC<WordLookupProps> = ({ onAddWordToTable }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState<number>(0);
  const [sourceInfo, setSourceInfo] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Autocomplete suggestions as user types
  useEffect(() => {
    let active = true;
    if (query.trim().length >= 1) {
      dictionaryService.getSuggestions(query).then(suggs => {
        if (active) setSuggestions(suggs);
      });
    } else {
      setSuggestions([]);
    }
    return () => { active = false; };
  }, [query]);

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm ?? query).trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);
    setSuggestions([]);

    try {
      const res = await dictionaryService.lookup(q);
      const allResults = [...res.exactMatches, ...res.suggestions];
      setEntries(allResults);
      setSelectedEntryIndex(0);
      setSelectedMeaningIndex(0);
      setSourceInfo(res.sourceInfo);
    } catch (err) {
      console.error('Lookup failed:', err);
      setEntries([]);
      setSourceInfo('Lỗi tra cứu từ điển. Vui lòng kiểm tra lại kết nối mạng hoặc nhập tay.');
    } finally {
      setIsSearching(false);
    }
  };

  const currentEntry = entries[selectedEntryIndex];

  const handleAddCurrent = () => {
    if (!currentEntry) return;

    const kanji = currentEntry.kanji;
    const reading = currentEntry.reading;
    const meaning = currentEntry.senses[selectedMeaningIndex]?.meaningVi ||
      currentEntry.senses.map(s => s.meaningVi).join('; ');

    onAddWordToTable(kanji, reading, meaning);

    // Reset input
    setQuery('');
    setEntries([]);
    setHasSearched(false);
  };

  const handleAddManualFallback = () => {
    if (!query.trim()) return;
    onAddWordToTable(query.trim(), '', '', 'Nhập thủ công (chưa có dữ liệu từ điển)');
    setQuery('');
    setEntries([]);
    setHasSearched(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
          <span>Tra cứu & Thêm từ tiếng Nhật</span>
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Nhập từ hoặc cụm từ có Kanji (ví dụ: <code>学校</code>, <code>白い</code>, <code>生</code>, <code>都合がいい</code>). Hệ thống tự động tra cách đọc Hiragana và nghĩa tiếng Việt.
        </p>
      </div>

      {/* Search Input Bar */}
      <div style={{ position: 'relative' }}>
        <form
          onSubmit={e => { e.preventDefault(); handleSearch(); }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input font-jp"
              style={{ paddingLeft: '2.5rem', fontSize: '1rem', fontWeight: 500 }}
              placeholder="Nhập từ Kanji, Hiragana hoặc Romaji..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="btn btn-primary"
            style={{ padding: '0 1.25rem' }}
          >
            {isSearching ? 'Đang tra...' : 'Tra cứu'}
          </button>
        </form>

        {/* Autocomplete Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 30,
            overflow: 'hidden'
          }}>
            {suggestions.map((sugg, i) => (
              <div
                key={i}
                onClick={() => {
                  setQuery(sugg);
                  handleSearch(sugg);
                }}
                className="font-jp"
                style={{
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {sugg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results View */}
      {currentEntry && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header of result */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span className="font-jp" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentEntry.kanji}
              </span>
              <span className="font-jp" style={{ fontSize: '1.2rem', color: '#a5b4fc', fontWeight: 600 }}>
                【{currentEntry.reading}】
              </span>
              {currentEntry.jlptLevel && (
                <span className="badge badge-primary">{currentEntry.jlptLevel}</span>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {sourceInfo}
            </div>
          </div>

          {/* Multiple readings choices if available */}
          {entries.length > 1 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Các cách đọc / từ liên quan khác:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {entries.map((entry, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedEntryIndex(idx);
                      setSelectedMeaningIndex(0);
                    }}
                    className={`btn ${selectedEntryIndex === idx ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', minHeight: 32 }}
                  >
                    <span className="font-jp">{entry.kanji} ({entry.reading})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meanings list */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Nghĩa tiếng Việt (chọn nghĩa phù hợp để thêm):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {currentEntry.senses.map((sense, sIdx) => (
                <div
                  key={sIdx}
                  onClick={() => setSelectedMeaningIndex(sIdx)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${selectedMeaningIndex === sIdx ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: selectedMeaningIndex === sIdx ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: selectedMeaningIndex === sIdx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {sIdx + 1}
                    </span>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {sense.meaningVi}
                    </span>
                  </div>
                  {selectedMeaningIndex === sIdx && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Add to draft table action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button
              onClick={handleAddCurrent}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Thêm vào bảng xem trước</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty / Not found fallback */}
      {hasSearched && entries.length === 0 && !isSearching && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d', fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>Không tìm thấy từ điển cho "{query}"</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {sourceInfo}
          </p>
          <div>
            <button
              type="button"
              onClick={handleAddManualFallback}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={15} />
              <span>Thêm từ "{query}" vào bảng để tự nhập cách đọc & nghĩa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
