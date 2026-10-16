import { createWorker } from 'tesseract.js';
import { OcrProgress, OcrResult, OcrService } from '../../types';
import { parseTwoPassOcr, RawOcrLine } from './tableParser';

export class ClientTesseractOcrService implements OcrService {
  private workerJpn: any = null;
  private workerVie: any = null;

  async processImage(
    imageSource: string | File | Blob | HTMLCanvasElement,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult> {
    const startTime = Date.now();

    onProgress?.({ status: 'Đang khởi tạo bộ máy OCR Tesseract...', progress: 0.05 });

    try {
      // 1. Initialize Japanese worker if not ready
      if (!this.workerJpn) {
        onProgress?.({ status: 'Đang tải dữ liệu ngôn ngữ tiếng Nhật (jpn)...', progress: 0.15 });
        this.workerJpn = await createWorker('jpn', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              onProgress?.({
                status: 'Đang nhận diện chữ tiếng Nhật...',
                progress: 0.2 + m.progress * 0.35, // 0.2 -> 0.55
              });
            }
          },
        });
      }

      // 2. Initialize Vietnamese worker if not ready
      if (!this.workerVie) {
        onProgress?.({ status: 'Đang tải dữ liệu ngôn ngữ tiếng Việt (vie)...', progress: 0.55 });
        this.workerVie = await createWorker('vie', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              onProgress?.({
                status: 'Đang nhận diện nghĩa tiếng Việt có dấu...',
                progress: 0.6 + m.progress * 0.3, // 0.6 -> 0.90
              });
            }
          },
        });
      }

      onProgress?.({ status: 'Đang quét lớp chữ tiếng Nhật...', progress: 0.25 });
      const retJpn = await this.workerJpn.recognize(imageSource);

      onProgress?.({ status: 'Đang quét lớp chữ tiếng Việt...', progress: 0.65 });
      const retVie = await this.workerVie.recognize(imageSource);

      onProgress?.({ status: 'Đang khớp hàng và cột theo bố cục bảng...', progress: 0.92 });

      const imgWidth = retJpn.data.image_width || (retVie.data.image_width || 600);
      const imgHeight = retJpn.data.image_height || (retVie.data.image_height || 1000);

      const jpnLines: RawOcrLine[] = (retJpn.data.lines || []).map((l: any) => ({
        text: l.text,
        confidence: l.confidence,
        bbox: l.bbox,
        words: (l.words || []).map((w: any) => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox,
        })),
      }));

      const vieLines: RawOcrLine[] = (retVie.data.lines || []).map((l: any) => ({
        text: l.text,
        confidence: l.confidence,
        bbox: l.bbox,
        words: (l.words || []).map((w: any) => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox,
        })),
      }));

      const rows = parseTwoPassOcr(jpnLines, vieLines, imgWidth, imgHeight);

      const processingTimeMs = Date.now() - startTime;
      onProgress?.({ status: 'Hoàn tất nhận diện bảng!', progress: 1.0 });

      return {
        rows,
        imageWidth: imgWidth,
        imageHeight: imgHeight,
        processingTimeMs,
        detectedColumnsCount: 3,
        engineName: 'Tesseract.js Client (2-Pass jpn+vie)',
      };
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      throw new Error(`Lỗi nhận diện OCR: ${err?.message || 'Không thể đọc ảnh'}`);
    }
  }

  async destroy() {
    if (this.workerJpn) {
      await this.workerJpn.terminate();
      this.workerJpn = null;
    }
    if (this.workerVie) {
      await this.workerVie.terminate();
      this.workerVie = null;
    }
  }
}

export const ocrService = new ClientTesseractOcrService();
