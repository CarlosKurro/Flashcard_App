import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Camera, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { ocrService } from '../services/ocr/ocrService';
import { OcrProgress, OcrTableRow } from '../types';

interface ImageUploaderProps {
  onRowsExtracted: (rows: OcrTableRow[], imagePreviewUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onRowsExtracted }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OcrProgress>({ status: '', progress: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      setErrorMsg('Tệp không được hỗ trợ. Vui lòng chọn ảnh định dạng PNG hoặc JPEG.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh quá lớn (>15MB). Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setErrorMsg(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    startOcr(file, url);
  };

  const startOcr = async (fileOrUrl: File | string, preview: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProgress({ status: 'Bắt đầu xử lý ảnh...', progress: 0.05 });

    try {
      const result = await ocrService.processImage(fileOrUrl, (prog) => {
        setProgress(prog);
      });

      if (!result.rows || result.rows.length === 0) {
        setErrorMsg('Không nhận diện được hàng từ vựng nào trong ảnh. Vui lòng kiểm tra lại góc chụp hoặc độ nét.');
      } else {
        onRowsExtracted(result.rows, preview);
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMsg(`Lỗi xử lý OCR: ${err.message || 'Không thể đọc ảnh'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    setIsProcessing(false);
    setProgress({ status: '', progress: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleLoadSample = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setProgress({ status: 'Đang tải ảnh mẫu 15 từ...', progress: 0.1 });

      // Fetch the sample image copied to local-data or static asset
      // In development / client, we can fetch from local-data/reference_image.jpg or load via canvas
      const response = await fetch('/sample.jpg');
      if (!response.ok) {
        // Fallback: try relative or show info
        throw new Error('Không thể tải trực tiếp qua HTTP. Vui lòng bấm "Chọn ảnh từ máy" và chọn ảnh tải về.');
      }
      const blob = await response.blob();
      const file = new File([blob], 'reference_image.jpg', { type: 'image/jpeg' });
      handleFileSelect(file);
    } catch (err: any) {
      // If direct fetch from /local-data fails because it is outside Vite root, prompt user to select file
      setErrorMsg('Vui lòng bấm "Chọn ảnh từ máy" và chọn tệp ảnh tham chiếu trong thư mục Downloads của bạn.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>Nhập ảnh bảng từ vựng (OCR)</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Hỗ trợ ảnh bảng 3 cột: <strong>Kanji – Hiragana – Nghĩa tiếng Việt</strong>. Ghép đúng theo từng hàng.
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            disabled={isProcessing}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
          >
            <Sparkles size={15} style={{ color: '#fcd34d' }} />
            <span>Nạp ảnh tham chiếu mẫu</span>
          </button>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {/* Dropzone & Preview */}
      {!previewUrl ? (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: isDragging ? 'var(--accent-gradient-subtle)' : 'rgba(15, 23, 42, 0.4)',
            transition: 'all var(--transition-normal)',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--accent-gradient-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <UploadCloud size={32} />
          </div>

          <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
            Kéo thả ảnh vào đây hoặc bấm để chọn tệp
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Hỗ trợ định dạng JPEG, PNG hoặc dán trực tiếp (Ctrl+V) từ bộ nhớ tạm
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <UploadCloud size={17} />
              <span>Chọn ảnh từ máy</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            >
              <Camera size={17} />
              <span>Chụp ảnh (Điện thoại)</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 320px) 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }} className="preview-container">
          {/* Image preview */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            background: '#000'
          }}>
            <img
              src={previewUrl}
              alt="Ảnh bảng từ vựng"
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {imageFile?.name || 'Ảnh đã nạp'}
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="btn btn-ghost"
                title="Chọn ảnh khác"
                style={{ padding: '0.25rem', color: '#fff' }}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Progress / Status display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', minHeight: 200 }}>
            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress.status}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.round(progress.progress * 100)}%</span>
                </div>
                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.round(progress.progress * 100)}%`,
                    height: '100%',
                    background: 'var(--accent-gradient)',
                    transition: 'width 0.2s ease-out'
                  }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lần xử lý đầu tiên có thể mất vài giây để tải model ngôn ngữ Tesseract. Các lần sau sẽ chạy nhanh tức thì.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.4rem 0.75rem' }}>
                  Đã hoàn tất nhận diện OCR
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Dữ liệu đã được trích xuất và đưa vào bảng chỉnh sửa 3 cột bên dưới. Bạn có thể kiểm tra từng ô trước khi lưu vào bộ flashcard.
                </p>
                <div>
                  <button
                    onClick={handleReset}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
                  >
                    <RefreshCw size={14} />
                    <span>Đổi sang ảnh khác</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div style={{
          background: 'var(--color-danger-bg)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fda4af',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}
    </div>
  );
};
