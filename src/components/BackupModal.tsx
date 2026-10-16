import React, { useState, useRef } from 'react';
import { exportBackup, importBackup, ImportResult } from '../storage/storageService';
import { Download, Upload, X, CheckCircle, AlertCircle, Database } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataRestored }) => {
  const [importStatus, setImportStatus] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `kanji_flashcards_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Lỗi xuất dữ liệu: ${err?.message || err}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const result = await importBackup(content);
        setImportStatus(result);
        if (result.success) {
          onDataRestored();
        }
      } catch (err: any) {
        setImportStatus({
          success: false,
          decksImported: 0,
          cardsImported: 0,
          error: `Lỗi đọc tệp: ${err?.message || err}`,
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setImportStatus({
        success: false,
        decksImported: 0,
        cardsImported: 0,
        error: 'Không thể đọc tệp từ thiết bị.',
      });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: 520,
        width: '100%',
        padding: '1.75rem',
        background: '#111827',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Sao lưu & Phục hồi dữ liệu</span>
          </h3>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Toàn bộ bộ thẻ và tiến độ học được lưu an toàn trong trình duyệt (IndexedDB). Bạn có thể xuất tệp JSON để lưu trữ ngoài hoặc chuyển sang thiết bị khác.
        </p>

        {/* Export Card */}
        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Xuất tệp sao lưu JSON</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tải về máy toàn bộ bộ thẻ và thẻ flashcard</div>
          </div>
          <button onClick={handleExport} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Download size={16} />
            <span>Tải JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Phục hồi từ tệp JSON</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nhập lại dữ liệu từ tệp sao lưu trước đó</div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="btn btn-secondary"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Upload size={16} />
            <span>{isImporting ? 'Đang đọc...' : 'Chọn tệp'}</span>
          </button>
        </div>

        {/* Status display */}
        {importStatus && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: importStatus.success ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            border: `1px solid ${importStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: importStatus.success ? '#6ee7b7' : '#fda4af',
          }}>
            {importStatus.success ? <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div>
              {importStatus.success ? (
                <div>
                  <strong>Phục hồi thành công!</strong> Đã nhập {importStatus.decksImported} bộ thẻ và {importStatus.cardsImported} thẻ flashcard.
                </div>
              ) : (
                <div>
                  <strong>Nhập tệp thất bại:</strong> {importStatus.error}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-outline">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
