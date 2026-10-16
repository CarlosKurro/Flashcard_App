export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
}

export interface OcrTableCell {
  text: string;
  confidence: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrTableRow {
  id: string;
  kanji: OcrTableCell;
  reading: OcrTableCell;
  meaning: OcrTableCell;
  rawText?: string;
  warning?: string;
}

export interface OcrResult {
  rows: OcrTableRow[];
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  detectedColumnsCount: number;
  engineName: string;
}

export interface OcrService {
  processImage(
    imageSource: string | File | Blob | HTMLCanvasElement,
    onProgress?: (progress: OcrProgress) => void
  ): Promise<OcrResult>;
}
