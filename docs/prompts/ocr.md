# Prompt con: OCR Developer

## 1. Mục tiêu cụ thể và phạm vi

- **Mục tiêu**:
  - Nghiên cứu và triển khai module OCR chạy trên trình duyệt (client-side) sử dụng `tesseract.js`.
  - Nhận diện chính xác bố cục bảng 3 cột trong ảnh từ vựng tiếng Nhật:
    - Cột 1: Từ tiếng Nhật (Kanji/Kana/cụm từ).
    - Cột 2: Cách đọc Hiragana.
    - Cột 3: Nghĩa tiếng Việt có dấu.
  - Phân tích vị trí phân chia cột và hàng (dựa trên bounding boxes hoặc đường kẻ phân cách bảng).
  - Khôi phục chính xác 15 hàng trong ảnh tham chiếu `local-data/reference_image.jpg`.
  - Cung cấp `OcrService` với tiến trình (progress callback) và kết quả có kèm độ tin cậy, vị trí, cảnh báo kiểm tra nếu có.
- **Không thuộc phạm vi**:
  - Không xây dựng UI đầy đủ (đó là việc của Frontend Developer).
  - Không tự ý sửa nghĩa tiếng Việt thành nghĩa khác mà không đánh dấu đề xuất (giữ nguyên nghĩa gốc trong ảnh, ví dụ "ấm áp" cho `涼しい`, "nhẹ" cho `低い`).
  - Không hardcode dữ liệu giả lập OCR.

## 2. Tài liệu, file đầu vào và hợp đồng dữ liệu

- **File đầu vào**:
  - Ảnh tham chiếu: `local-data/reference_image.jpg`.
  - Bản chép đối chiếu 15 dòng trong mục 4 của `PROMPT.md`.
- **Hợp đồng dữ liệu (`src/types/ocr.ts`)**:
  ```typescript
  export interface OcrProgress {
    status: string; // e.g. "loading tesseract", "recognizing text"
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
    warning?: string; // e.g., "Nghĩa trong ảnh có thể khác nghĩa thông dụng"
  }

  export interface OcrResult {
    rows: OcrTableRow[];
    imageWidth: number;
    imageHeight: number;
    processingTimeMs: number;
    detectedColumnsCount: number;
  }

  export interface OcrService {
    processImage(
      imageSource: string | File | Blob | HTMLCanvasElement,
      onProgress?: (progress: OcrProgress) => void
    ): Promise<OcrResult>;
  }
  ```

## 3. Phân vùng file và trách nhiệm

- **Được toàn quyền phụ trách**:
  - `src/services/ocr/` (engine, preprocessor, column-detector, row-segmenter, adapter).
  - Scripts thử nghiệm đo lường OCR trong `scripts/test-ocr.js` hoặc `scripts/test-ocr.ts`.
- **File dùng chung (chỉ đề xuất)**:
  - `src/types/index.ts` hoặc `src/types/ocr.ts` (thống nhất với Tech Lead).
  - `package.json` (đề xuất thư viện xử lý ảnh hoặc tesseract version).

## 4. Phụ thuộc, giả định và tài nguyên

- Sử dụng `tesseract.js` (hỗ trợ load language data `jpn` và `vie`).
- Chạy trên client, tải worker/tessdata qua CDN hoặc local assets được cache lại bởi Service Worker.
- Cần canvas để tiền xử lý ảnh (chuyển grayscale, tăng tương phản, binarization nếu cần để tách dòng kẻ).

## 5. Các bước triển khai và tiêu chí hoàn thành

1. **Bước 1**: Viết script Node/Browser chạy Tesseract với ngôn ngữ `jpn+vie`.
2. **Bước 2**: Thực hiện thử nghiệm 2 cách tiếp cận:
   - Cách A: Nhận diện toàn ảnh và phân tích bounding box của từng từ/dòng.
   - Cách B: Tiền xử lý phát hiện 3 cột (x: 0-32%, 32-60%, 60-100%) và các đường phân cách ngang (horizontal lines), sau đó OCR từng vùng với ngôn ngữ chuyên biệt (`jpn` cho cột 1 & 2, `vie` cho cột 3).
3. **Bước 3**: So sánh độ chính xác trên 15 hàng của ảnh tham chiếu.
4. **Bước 4**: Tích hợp module vào `src/services/ocr/TesseractOcrService.ts` tuân thủ interface `OcrService`.
5. **Tiêu chí hoàn thành**:
   - Đọc được đầy đủ 15 hàng từ ảnh mẫu `reference_image.jpg`.
   - Giữ nguyên cụm từ như `都合がいい` (không bị cắt lẻ).
   - Dấu tiếng Việt (trắng, ấm áp, chính xác, vui vẻ, gần, thuận tiện, mạnh mẽ, nhẹ, rộng, mập, mỏng, ngắn, tốt, yếu, xấu) đạt tỷ lệ nhận diện cao.
   - Có callback báo tiến độ thực tế từ Tesseract worker.

## 6. Cách báo cáo kết quả

- Tỷ lệ hàng đọc đúng trên ảnh mẫu (bao nhiêu/15 hàng).
- Thời gian xử lý trung bình.
- Các lỗi nhận diện còn tồn tại và giải pháp hỗ trợ trên UI (ví dụ ô sửa tay).
- File mã nguồn và tài liệu đo lường đã hoàn thành.
