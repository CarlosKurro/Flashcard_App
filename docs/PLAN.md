# Kế hoạch phát triển: Kanji Flashcard PWA

## Tổng quan dự án

Ứng dụng Flashcard học từ vựng tiếng Nhật - tiếng Việt hỗ trợ Web & Mobile qua PWA với 2 luồng nhập liệu cốt lõi:
1. **Nhập ảnh bảng từ vựng** -> OCR nhận diện 3 cột (Từ tiếng Nhật - Hiragana - Nghĩa tiếng Việt) -> Ghép hàng -> Bảng xem/sửa -> Lưu vào bộ flashcard.
2. **Nhập từ tiếng Nhật đơn lẻ** -> Tra cứu từ điển tự động gợi ý Hiragana & Nghĩa tiếng Việt (hỗ trợ đa nghĩa/đa cách đọc) -> Bảng xem/sửa -> Lưu vào bộ flashcard.
3. **Quản lý bộ flashcard & Học** -> Tạo, sửa, xóa bộ thẻ; Lật thẻ, đánh giá "Chưa nhớ" / "Đã nhớ"; Lưu trữ bền vững trên thiết bị (IndexedDB); Xuất/Nhập JSON; PWA offline.

---

## Phân công vai trò

| Vai trò | Phụ trách chính | Đầu ra chính |
| --- | --- | --- |
| **Tech Lead / Integrator** | Kiến trúc tổng thể, hợp đồng dữ liệu, khởi tạo project, điều phối, tích hợp module, nghiệm thu | `docs/PLAN.md`, `docs/STATUS.md`, `docs/DECISIONS.md`, cấu trúc mã, build & deploy |
| **OCR Developer** | Khảo sát Tesseract.js / Web OCR, tiền xử lý ảnh, thuật toán phân chia cột & hàng, adapter OCR | `docs/prompts/ocr.md`, `src/services/ocr/`, báo cáo thực nghiệm OCR ảnh thật |
| **Dictionary Developer** | Nguồn từ điển Nhật - Việt, tra cứu đa nghĩa, xử lý cách đọc, adapter từ điển | `docs/prompts/dictionary-data.md`, `src/services/dictionary/`, `docs/DATA_SOURCES.md` |
| **Frontend / PWA Developer** | Giao diện responsive (Desktop/Mobile), bảng chỉnh sửa 3 cột, màn hình học flashcard, IndexedDB store, PWA manifest & SW | `docs/prompts/frontend-pwa.md`, `src/components/`, `src/views/`, `src/storage/`, PWA assets |
| **QA / Reviewer** | Bộ test tự động (Vitest), kiểm thử luồng UI, đo chất lượng OCR, offline, xuất nhập dữ liệu, lập báo cáo QA | `docs/prompts/qa-review.md`, `src/__tests__/`, `docs/QA.md` |

---

## Lộ trình từng giai đoạn & Checklist

### Giai đoạn 0: Khảo sát và lập trạng thái (Khởi động)
- [x] Đọc `PROMPT.md`, `README.md`, kiểm tra Git, runtime (Node v24, npm 11).
- [x] Xác minh sự tồn tại của ảnh tham chiếu `C:/Users/Lenovo/Downloads/e06e8ffd-dcb4-4a8f-91c2-f0eab670406c.jpg` và sao lưu vào `local-data/`.
- [x] Tạo `docs/PLAN.md` và `docs/STATUS.md`.
- [x] Tạo các prompt con trong `docs/prompts/` theo chuẩn Section 5 của `PROMPT.md`.

### Giai đoạn 1: Kiểm chứng OCR và nguồn từ điển
- [x] **OCR Developer**:
  - [x] Cài đặt thử nghiệm Tesseract.js (`jpn` + `vie` / phân vùng 3 cột theo vị trí).
  - [x] Thử nghiệm với ảnh thật `local-data/reference_image.jpg`.
  - [x] So sánh phương pháp toàn ảnh vs chia 3 cột và cắt theo hàng (dựa trên bounding boxes và tọa độ Y).
  - [x] Đo lường độ chính xác trên 15 hàng của ảnh tham chiếu.
  - [x] Ghi nhận kết quả và quyết định kỹ thuật vào `docs/DECISIONS.md`.
- [x] **Dictionary Developer**:
  - [x] Khảo sát nguồn dữ liệu Nhật - Việt chất lượng cao (JMdict tiếng Việt, Mazii Open Search API).
  - [x] Đảm bảo hỗ trợ từ đơn, từ ghép, từ có okurigana (`白い`, `涼しい`, `都合がいい`).
  - [x] Xử lý đa nghĩa và đa cách đọc (ví dụ `生` -> seikatsu, nama, umareru...).
  - [x] Xây dựng bộ từ điển tích hợp sẵn (offline bundle) cho các từ phổ thông và fallback API tra cứu mở.
  - [x] Ghi công, giấy phép và hạn mức vào `docs/DATA_SOURCES.md`.

### Giai đoạn 2: Khởi tạo nền tảng & Hợp đồng dữ liệu
- [x] Khởi tạo Vite + React + TypeScript + Modern CSS Variables & Design System.
- [x] Cài đặt các thư viện thiết yếu: `idb`, `tesseract.js`, `lucide-react`, `canvas-confetti`, `vitest`, `vite-plugin-pwa`.
- [x] Thiết lập `src/types/`:
  - `VocabularyItem`, `DraftTableRow`, `Deck`, `Flashcard`, `OcrService`, `DictionaryService`.
- [x] Thiết lập lưu trữ IndexedDB với schema versioning và migration (`src/storage/db.ts`).

### Giai đoạn 3: Xây dựng luồng nhập liệu hoàn chỉnh
- [x] **Luồng A (Nhập ảnh)**:
  - Component Upload / Chụp ảnh (hỗ trợ kéo thả, chọn tệp, paste ảnh từ clipboard).
  - Xem trước ảnh + thanh tiến trình OCR (tải model -> xử lý -> hoàn tất).
  - Bảng xem trước 3 cột: sửa từng ô trực tiếp, thêm/xóa hàng, chọn/bỏ chọn hàng muốn lưu.
  - Đánh dấu các ô cần kiểm tra (như từ trong ảnh mẫu: `涼しい` = "ấm áp" vs đề xuất "mát mẻ", `低い` = "nhẹ" vs đề xuất "thấp").
- [x] **Luồng B (Nhập từ tiếng Nhật)**:
  - Input nhập từ tiếng Nhật có Kanji hoặc Hiragana.
  - Gợi ý tức thì: tra cứu từ điển -> hiển thị danh sách cách đọc và nghĩa tiếng Việt.
  - Cho phép người dùng chọn cách đọc/nghĩa phù hợp hoặc sửa tay.
  - Thêm vào danh sách tạm trước khi lưu thành bộ thẻ.

### Giai đoạn 4: Quản lý bộ thẻ, Học flashcard, Lưu trữ & PWA
- [x] Quản lý bộ thẻ: Danh sách bộ thẻ, tạo bộ thẻ mới, sửa tên, xóa bộ thẻ, đếm số thẻ đã nhớ/chưa nhớ.
- [x] Màn hình học thẻ (Flashcard Player):
  - Hiển thị mặt trước (Kanji + ngữ cảnh).
  - Thao tác lật thẻ (Click / Phím cách / Vuốt chạm trên mobile).
  - Mặt sau hiển thị Hiragana + Nghĩa tiếng Việt.
  - Đánh dấu: "Chưa nhớ" (cần ôn lại) / "Đã nhớ".
  - Hiển thị thanh tiến độ phiên học, tóm tắt kết quả và confetti khi học xong.
- [x] Sao lưu & Phục hồi (Export / Import JSON):
  - Xuất toàn bộ hoặc từng bộ thẻ ra file JSON chuẩn.
  - Nhập JSON có validation schema, báo lỗi rõ ràng nếu file hỏng.
  - Xử lý trùng lặp (ghi đè, bỏ qua hoặc thêm mới).
- [x] PWA:
  - Manifest.json với icons, tên app, theme color, display standalone.
  - Service Worker (Workbox qua Vite PWA) cache static assets và app shell.
  - Khả năng mở app và học các bộ thẻ đã lưu khi hoàn toàn offline.

### Giai đoạn 5: QA, Kiểm thử & Bàn giao
- [x] Viết test tự động:
  - Test thuật toán phân tích bảng OCR và tách cột.
  - Test service tra cứu từ điển (từ đơn, từ ghép, xử lý đa nghĩa).
  - Test xuất/nhập JSON và validation schema.
- [x] Đo lường chất lượng thực tế trên ảnh tham chiếu `local-data/reference_image.jpg` và ghi nhận vào `docs/QA.md`.
- [x] Kiểm thử Responsive trên nhiều độ phân giải (Desktop, Tablet, Mobile 375px/390px/412px).
- [x] Cập nhật `README.md` với hướng dẫn cài đặt, chạy dev, build production, hướng dẫn PWA và ghi nhận giấy phép.
- [x] Nghiệm thu toàn diện theo Checklist Mục 7 trong `PROMPT.md`.
