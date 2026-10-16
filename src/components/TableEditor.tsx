import React, { useState } from 'react';
import { DraftTableRow, Deck } from '../types';
import { DuplicateStrategy } from '../storage/storageService';
import { Trash2, Plus, AlertTriangle, CheckSquare, Square, Save, FolderPlus } from 'lucide-react';

interface TableEditorProps {
  rows: DraftTableRow[];
  decks: Deck[];
  selectedDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onUpdateRow: (id: string, field: 'kanji' | 'reading' | 'meaning', value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSaveToDeck: (targetDeckId: string, newDeckName?: string, strategy?: DuplicateStrategy) => Promise<void>;
  isSaving?: boolean;
}

export const TableEditor: React.FC<TableEditorProps> = ({
  rows,
  decks,
  selectedDeckId,
  onSelectDeck,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onToggleSelect,
  onToggleSelectAll,
  onSaveToDeck,
  isSaving = false,
}) => {
  const [isCreatingNewDeck, setIsCreatingNewDeck] = useState(decks.length === 0);
  const [newDeckName, setNewDeckName] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('add_anyway');

  const selectedCount = rows.filter(r => r.selected).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  const handleSave = async () => {
    if (selectedCount === 0) {
      alert('Vui lòng chọn ít nhất một hàng từ vựng để lưu vào bộ thẻ.');
      return;
    }

    if (isCreatingNewDeck) {
      if (!newDeckName.trim()) {
        alert('Vui lòng nhập tên cho bộ thẻ mới.');
        return;
      }
      await onSaveToDeck('__new__', newDeckName.trim(), duplicateStrategy);
      setNewDeckName('');
      setIsCreatingNewDeck(false);
    } else {
      if (!selectedDeckId) {
        alert('Vui lòng chọn bộ thẻ đích.');
        return;
      }
      await onSaveToDeck(selectedDeckId, undefined, duplicateStrategy);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Table Header Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Bảng từ vựng xem trước</span>
            <span className="badge badge-primary">{rows.length} hàng ({selectedCount} đã chọn)</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chỉnh sửa trực tiếp nội dung từng ô, thêm/bớt hàng trước khi tạo flashcard.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onToggleSelectAll}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8125rem' }}
          >
            {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
            <span>{allSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}</span>
          </button>

          <button
            onClick={onAddRow}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8125rem' }}
          >
            <Plus size={15} />
            <span>Thêm hàng</span>
          </button>
        </div>
      </div>

      {/* Warnings overview if any */}
      {rows.some(r => r.warning) && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: '#fcd34d'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            Một số hàng có cảnh báo khác biệt giữa chữ trong ảnh và từ điển thông dụng (được đánh dấu màu vàng). Bạn có thể giữ nguyên bản chép hoặc sửa lại theo ý muốn.
          </div>
        </div>
      )}

      {/* Table Component */}
      <div className="table-responsive-wrapper">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ width: 44, textAlign: 'center' }}>#</th>
              <th style={{ width: 50, textAlign: 'center' }}>Chọn</th>
              <th style={{ minWidth: 150 }}>Từ tiếng Nhật (Kanji)</th>
              <th style={{ minWidth: 160 }}>Hiragana</th>
              <th style={{ minWidth: 220 }}>Nghĩa tiếng Việt</th>
              <th style={{ width: 60, textAlign: 'center' }}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  Chưa có dữ liệu. Vui lòng tải ảnh bảng từ vựng hoặc tra cứu từ đơn tiếng Nhật ở trên.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id} style={{ opacity: row.selected ? 1 : 0.55 }}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {idx + 1}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => onToggleSelect(row.id)}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-editable-cell font-jp"
                      value={row.kanji}
                      onChange={e => onUpdateRow(row.id, 'kanji', e.target.value)}
                      placeholder="VD: 白い, 学校..."
                      style={{ fontWeight: 600, fontSize: '1.05rem' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="table-editable-cell font-jp"
                      value={row.reading}
                      onChange={e => onUpdateRow(row.id, 'reading', e.target.value)}
                      placeholder="VD: しろい, がっこう..."
                    />
                  </td>
                  <td>
                    <div>
                      <input
                        type="text"
                        className="table-editable-cell"
                        value={row.meaning}
                        onChange={e => onUpdateRow(row.id, 'meaning', e.target.value)}
                        placeholder="VD: trắng, trường học..."
                      />
                      {row.warning && (
                        <div style={{
                          fontSize: '0.72rem',
                          color: '#fcd34d',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginTop: '0.2rem',
                          paddingLeft: '0.6rem'
                        }}>
                          <AlertTriangle size={12} />
                          <span>{row.warning}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onDeleteRow(row.id)}
                      className="btn-ghost"
                      title="Xóa hàng này"
                      style={{ color: 'var(--color-danger)', padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Target Deck & Save Section */}
      {rows.length > 0 && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            {/* Target deck selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Bộ thẻ đích:
              </label>
              {isCreatingNewDeck ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nhập tên bộ thẻ mới..."
                    value={newDeckName}
                    onChange={e => setNewDeckName(e.target.value)}
                  />
                  {decks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewDeck(false)}
                      className="btn btn-secondary"
                      style={{ whiteSpace: 'nowrap', padding: '0 0.8rem', fontSize: '0.8rem' }}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    className="select"
                    value={selectedDeckId}
                    onChange={e => onSelectDeck(e.target.value)}
                  >
                    {decks.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.cardsCount || 0} thẻ)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewDeck(true)}
                    className="btn btn-secondary"
                    title="Tạo bộ thẻ mới"
                    style={{ whiteSpace: 'nowrap', padding: '0 0.8rem', fontSize: '0.8rem' }}
                  >
                    <FolderPlus size={16} />
                    <span className="hide-on-mobile">Mới</span>
                  </button>
                </div>
              )}
            </div>

            {/* Duplicate strategy */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Xử lý khi thẻ bị trùng từ:
              </label>
              <select
                className="select"
                value={duplicateStrategy}
                onChange={e => setDuplicateStrategy(e.target.value as DuplicateStrategy)}
              >
                <option value="add_anyway">Thêm mới bình thường (cho phép từ trùng)</option>
                <option value="skip">Bỏ qua từ đã tồn tại trong bộ thẻ</option>
                <option value="overwrite">Ghi đè nội dung thẻ đã có</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={isSaving || selectedCount === 0}
              className="btn btn-primary"
              style={{ minWidth: 200 }}
            >
              <Save size={18} />
              <span>{isSaving ? 'Đang lưu thẻ...' : `Lưu ${selectedCount} thẻ vào bộ`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
