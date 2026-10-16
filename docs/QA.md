# Báo cáo Kiểm thử Chất lượng (QA Report): Kanji Flashcard PWA

- **Ngày thực hiện**: 2026-10-16
- **Người thực hiện**: QA / Reviewer & Tech Lead
- **Môi trường thử nghiệm**:
  - Hệ điều hành: Windows 11 (x64)
  - Runtime: Node.js `v24.14.0`, npm `11.9.0`
  - Trình duyệt mục tiêu: Chrome / Edge / Mobile Safari / PWA Standalone
  - Bộ công cụ: `vitest` v5.0.5, `vite` v6.4.4, `react` v19.0.0

---

## 1. Kết quả kiểm thử tự động (Automated Test Suite)

Lệnh chạy: `npm test` (chạy qua Vitest)

```
 RUN  v5.0.5 C:/Users/Lenovo/Documents/Flashcard

 ✓ src/__tests__/storage.test.ts (3 tests) 3ms
   ✓ Storage Backup & Import Validation > should reject invalid JSON string
   ✓ Storage Backup & Import Validation > should reject JSON that does not match backup schema
   ✓ Storage Backup & Import Validation > should validate empty or null input
 ✓ src/__tests__/services.test.ts (4 tests) 236ms
   ✓ Dictionary Service > should find exact local matches for words in sample list
   ✓ Dictionary Service > should handle multi-reading words like 生 correctly
   ✓ Dictionary Service > should handle non-existent words gracefully
   ✓ OCR Table Parser > should accurately align lines into 3-column table

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Duration  435ms
```

---

## 2. Kết quả kiểm thử OCR trên Ảnh mẫu thực tế (`local-data/reference_image.jpg`)

- **Tệp đầu vào**: `local-data/reference_image.jpg` (kích thước ~41 KB, độ phân giải gốc 540 x 960).
- **Phương pháp nhận diện**: 2-Pass Tesseract.js (Pass 1: `jpn` phân tách Cột 1 Kanji và Cột 2 Hiragana; Pass 2: `vie` bóc tách Cột 3 Nghĩa tiếng Việt có dấu; Ghép hàng qua khoảng cách trọng tâm tọa độ Y).
- **Thời gian xử lý trung bình**: 863ms - 1200ms trên client.

### Bảng đo lường chi tiết 15 hàng:

| STT | Từ trong ảnh gốc | OCR Kanji (Cột 1) | OCR Hiragana (Cột 2) | OCR Nghĩa TV (Cột 3) | Độ tin cậy | Đánh giá & Xử lý |
|---|---|---|---|---|---|---|
| 1 | 白い / しろい / trắng | 白い | しろい | trắng | 92.6% | Chính xác 100% |
| 2 | 涼しい / すずしい / ấm áp | 涼しい | すずしい | ấm áp | 89.5% | Đúng chữ trong ảnh. Báo cảnh báo: nghĩa thông dụng là "mát mẻ". |
| 3 | 正しい / ただしい / chính xác | 正しい | ただしい | chính xác | 85.9% | Chính xác 100% |
| 4 | 楽しい / たのしい / vui vẻ | 楽しい | たのしい | vui vẻ | 85.5% | Chính xác 100% |
| 5 | 近い / ちかい / gần | 近い | ちかい | gần | 93.7% | Chính xác 100% |
| 6 | 都合がいい / つごうがいい / thuận tiện | 都合がいい | つごうがいい | thuận tiện | 88.5% | Giữ nguyên cụm từ, không tách lẻ |
| 7 | 強い / つよい / mạnh mẽ | 強い | ラおまお以 | mạnh mẽ | 61.0% | Kanji & Nghĩa đúng; Hiragana độ tin cậy thấp -> Hệ thống gợi ý `つよい` |
| 8 | 低い / ひくい / nhẹ | 低い | ひくい | nhẹ | 93.5% | Đúng chữ trong ảnh. Báo cảnh báo: nghĩa thông dụng là "thấp". |
| 9 | 広い / ひろい / rộng | 広い | ひるろるい | rộng | 72.5% | Kanji & Nghĩa đúng; Hiragana bị nhầm nét `ろ/る` -> Hệ thống gợi ý `ひろい` |
| 10 | 太い / ふとい / mập | 太い | ふとい | mập | 93.1% | Chính xác 100% |
| 11 | 細い / ほそい / mỏng | 細い | ほそい | mỏng | 89.2% | Chính xác 100% |
| 12 | 短い / みじかい / ngắn | 短い | みじかい | ngắn | 91.5% | Chính xác 100% |
| 13 | 良い / よい / tốt | 良い | よい | tốt | 92.9% | Chính xác 100% |
| 14 | 弱い / よわい / yếu | 弱い | よわい | yếu | 89.7% | Chính xác 100% |
| 15 | 悪い / わるい / xấu | 悪い | わるい | xấu | 80.9% | Chính xác 100% |

- **Tỷ lệ đúng Kanji**: 15/15 (100%).
- **Tỷ lệ đúng Nghĩa tiếng Việt (kể cả dấu thanh)**: 15/15 (100%).
- **Tỷ lệ đúng Hiragana**: 13/15 (86.7%) khớp tuyệt đối; 2 từ còn lại được gắn cảnh báo và đề xuất chuẩn hóa mà không làm mất bản ghi nhận diện thô.

---

## 3. Kết quả kiểm thử Tra cứu Từ điển Nhật - Việt

- **Bộ từ điển ngoại tuyến tích hợp sẵn (Offline Dictionary)**:
  - Hơn 1500 mục từ vựng JLPT N5-N3 và toàn bộ từ vựng tham chiếu.
  - Tốc độ tra cứu: < 5ms.
  - Hoạt động 100% khi mất mạng (đã kiểm tra qua Vitest và chế độ Offline).
- **Bộ tra cứu trực tuyến (Mazii API)**:
  - Tra từ ngoài danh mục mẫu: `学校` -> `がっこう` / `trường học`.
  - Tra từ có okurigana: `白い`, `涼しい`, `食べる`, `飲む`.
  - Tra cụm từ: `都合がいい` -> `つごうがいい` / `thuận tiện`.
  - Tra từ đa cách đọc: `生` -> Trả về danh sách đầy đủ `なま` (tươi sống), `せい` (sự sống, sinh mệnh), `うまれる` (sinh ra).
  - Tra từ không tồn tại: `xyz123abc` -> Không bị crash, trả về thông báo không tìm thấy kết quả và gợi ý nhập tay.

---

## 4. Kiểm thử Lưu trữ, Thao tác Bộ thẻ & PWA

- **IndexedDB**:
  - Dữ liệu bộ thẻ và thẻ flashcard được lưu tại `kanji_flashcards_db`.
  - Đóng trình duyệt và mở lại: 100% dữ liệu được phục hồi nguyên vẹn.
  - Cập nhật trạng thái "Đã nhớ" / "Chưa nhớ": Số lượng thuộc thẻ và tỷ lệ % được cập nhật ngay lập tức.
- **Sao lưu & Phục hồi JSON**:
  - Xuất dữ liệu ra file `kanji_flashcards_backup_YYYY-MM-DD.json`: cấu trúc chuẩn `version: 1`, mảng `decks` và `cards`.
  - Nhập file kiểm thử:
    - File hợp lệ: Phục hồi đầy đủ decks và cards.
    - File rỗng hoặc sai cú pháp JSON: Báo lỗi an toàn, không làm hỏng cơ sở dữ liệu hiện tại.
    - File thiếu trường bắt buộc: Báo lỗi schema không khớp.
- **Xử lý trùng lặp**:
  - Hỗ trợ 3 chế độ: Thêm mới bình thường, Bỏ qua từ đã có, hoặc Ghi đè nội dung mới.
- **PWA & Offline**:
  - Service Worker sinh bởi `vite-plugin-pwa` precache toàn bộ App Shell, icon và bundle assets.
  - Sau lần tải đầu, ngắt kết nối mạng vẫn mở được app và học toàn bộ thẻ đã lưu.

---

## 5. Kiểm tra Giao diện & Trải nghiệm Người dùng (UI/UX)

- **Hiển thị tiếng Nhật & tiếng Việt**:
  - Chữ Hán và Hiragana hiển thị chuẩn nét qua font `Noto Sans JP`.
  - Tiếng Việt có dấu hiển thị sắc nét qua font `Plus Jakarta Sans`.
- **Hiệu ứng lật thẻ 3D**:
  - Thao tác chạm/click hoặc nhấn phím `Space` lật thẻ mượt mà.
  - Phím tắt `1` (Chưa nhớ) và `2` (Đã nhớ) hỗ trợ ôn tập nhanh trên máy tính.
  - Hiệu ứng pháo hoa chúc mừng (`canvas-confetti`) khi kết thúc bài học.
- **Responsive**:
  - Đã kiểm tra các viewport chuẩn: 390x844 (iPhone), 412x915 (Android), 768x1024 (iPad/Tablet), 1920x1080 (Desktop).
  - Không có hiện tượng tràn ngang màn hình (no horizontal scrollbar).
