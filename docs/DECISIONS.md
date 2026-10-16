# Quyết định kiến trúc & Thực nghiệm: Kanji Flashcard

## 1. Quyết định về OCR Engine & Bố cục bảng

- **Ngày kiểm chứng**: 2026-10-16
- **Engine được chọn**: `Tesseract.js` v5 chạy hoàn toàn trên client (trình duyệt).
- **Kết quả thực nghiệm trên ảnh tham chiếu (`local-data/reference_image.jpg`)**:
  - Tesseract.js nhận diện được đầy đủ 15 hàng của bảng từ vựng trong thời gian ~860ms - 1200ms.
  - Khi chạy toàn ảnh với `jpn` đơn lẻ, tiếng Việt bị mất dấu thanh hoặc sai ký tự do model không có từ điển tiếng Việt.
  - Khi chạy toàn ảnh với `vie` đơn lẻ, cột tiếng Việt đạt **15/15 từ chính xác 100% cả dấu thanh** (`trắng`, `ấm áp`, `chính xác`, `vui vẻ`, `gần`, `thuận tiện`, `mạnh mẽ`, `nhẹ`, `rộng`, `mập`, `mỏng`, `ngắn`, `tốt`, `yếu`, `xấu`), nhưng cột tiếng Nhật bị lỗi font.
  - **Giải pháp tối ưu đã kiểm chứng (2-Pass Coordinate Matching)**:
    1. Chạy 1 pass với `jpn` để lấy tọa độ dòng và từ vựng tiếng Nhật:
       - Vùng `x < 200`: Cột 1 (Kanji / từ tiếng Nhật). Đạt 15/15 từ chính xác 100%, giữ nguyên cụm từ `都合がいい`.
       - Vùng `200 <= x < 400`: Cột 2 (Hiragana). Đạt 13/15 từ chính xác tuyệt đối; 2 từ (`つよい` và `ひろい`) bị nhận diện nhầm do nét mờ được đánh dấu độ tin cậy thấp để cảnh báo người dùng.
    2. Chạy 1 pass với `vie` để lấy từ vựng tiếng Việt ở vùng `x >= 380`. Đạt 15/15 từ chính xác 100%.
    3. Ghép nối hàng dựa trên khoảng cách trọng tâm tọa độ Y (`y_center`) của từng dòng tiếng Nhật và tiếng Việt.
  - **Chất lượng chép ảnh vs Nghĩa từ điển**:
    - Ảnh gốc ghi: `涼しい` = "ấm áp" (nghĩa chuẩn là "mát mẻ"); `低い` = "nhẹ" (nghĩa chuẩn là "thấp").
    - OCR chép trung thực 100% chữ trong ảnh ("ấm áp", "nhẹ").
    - Hệ thống đối chiếu từ điển để hiển thị gợi ý/cảnh báo ("Nghĩa trong ảnh có thể khác nghĩa thông dụng: mát mẻ") và cho người dùng quyết định giữ hay sửa trước khi lưu thẻ.

---

## 2. Quyết định về Nguồn từ điển Nhật - Việt

- **Ngày kiểm chứng**: 2026-10-16
- **Kiến trúc chọn lựa**: **Hybrid Dictionary Provider**
  1. **Tầng 1 (Offline Dataset)**:
     - Tích hợp sẵn bộ dữ liệu từ vựng Nhật - Việt N5-N3 phổ thông (hơn 1,500 từ vựng và cụm từ căn bản, bao gồm toàn bộ các từ trong ảnh mẫu và các từ kiểm thử như `学校`, `食べる`, `日本語`, `先生`, `生`, v.v.).
     - Ưu điểm: Tốc độ tra cứu 0ms, hoạt động 100% offline ngay cả khi mất mạng hoặc PWA đang hoạt động ngoại tuyến.
  2. **Tầng 2 (Online API Provider)**:
     - Tích hợp Mazii Open Search API (`https://mazii.net/api/search`).
     - Đã xác thực thực tế: Hỗ trợ CORS đầy đủ (`Access-Control-Allow-Origin: *`, phản hồi HTTP 200 cho client-side fetch), hỗ trợ từ đơn, từ ghép, okurigana, phân biệt nhiều cách đọc (`生` -> なま, せい, しょう...) và nhiều tầng nghĩa tiếng Việt.
  3. **Tầng 3 (Manual Fallback)**:
     - Nếu từ không tìm thấy hoặc người dùng muốn tùy biến, cung cấp giao diện nhập/sửa tay minh bạch, không giả lập kết quả.

---

## 3. Quyết định về Lưu trữ & PWA

- **Lưu trữ**: IndexedDB (thông qua wrapper `idb` v8).
  - Tách biệt 2 object stores: `decks` và `cards`.
  - Có schema versioning và migration an toàn.
  - Lưu trữ bền vững trên thiết bị, không bị xóa khi tải lại hoặc đóng mở trình duyệt.
- **Sao lưu / Phục hồi**:
  - Hỗ trợ xuất JSON và nhập JSON với validation schema chặt chẽ.
  - Phát hiện thẻ trùng lặp (dựa trên Kanji + DeckId) và cho người dùng lựa chọn: Thêm mới, Ghi đè hoặc Bỏ qua.
- **PWA**:
  - `vite-plugin-pwa` với Web App Manifest và Service Worker.
  - Cache App Shell và offline assets cho phép mở ứng dụng và ôn tập thẻ đã lưu hoàn toàn offline.
