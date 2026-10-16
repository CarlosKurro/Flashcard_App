# Trạng thái dự án: Kanji Flashcard PWA

## Cập nhật gần nhất
- **Thời gian**: 2026-10-16
- **Giai đoạn hiện tại**: Giai đoạn 5 (Hoàn tất toàn bộ quy trình & Nghiệm thu)
- **Người thực hiện**: Tech Lead / Integrator

---

## Tóm tắt hiện trạng

1. **Môi trường & Công cụ**:
   - Node.js `v24.14.0`, npm `11.9.0` trên Windows.
   - Vite 6 + React 19 + TypeScript.
   - Kho Git kết nối `origin https://github.com/CarlosKurro/Flashcard_App.git`.
   - File tham chiếu `local-data/reference_image.jpg` và `public/sample.jpg` (được bảo vệ trong `.gitignore`).

2. **Các giai đoạn đã hoàn thành**:
   - **Giai đoạn 0 (Khảo sát & Lập trạng thái)**: Hoàn tất `docs/PLAN.md`, `docs/STATUS.md`, các prompt con `docs/prompts/ocr.md`, `docs/prompts/dictionary-data.md`, `docs/prompts/frontend-pwa.md`, `docs/prompts/qa-review.md`.
   - **Giai đoạn 1 (Kiểm chứng OCR & Nguồn từ điển)**: Đã kiểm chứng OCR thật trên ảnh mẫu đạt 15/15 hàng (100% Kanji, 100% Nghĩa tiếng Việt); kiểm chứng Mazii API và nguồn offline; ghi nhận tại `docs/DECISIONS.md` và `docs/DATA_SOURCES.md`.
   - **Giai đoạn 2 (Khởi tạo nền tảng & Hợp đồng dữ liệu)**: Thiết lập Types dùng chung, IndexedDB schema (`idb`), Client Tesseract OCR Service 2-pass, Hybrid Dictionary Service.
   - **Giai đoạn 3 (Xây luồng nhập liệu hoàn chỉnh)**: Tab OCR nhận diện ảnh bảng 3 cột; Tab Tra từ đơn tiếng Nhật với autocomplete, đa cách đọc, đa nghĩa; Bảng TableEditor 3 cột sửa ô, thêm/xóa/chọn dòng, cảnh báo nghĩa thông dụng.
   - **Giai đoạn 4 (Học Flashcard, Lưu trữ & PWA)**: Quản lý danh sách bộ thẻ, Study Mode lật thẻ 3D, chấm điểm nhớ (Space / 1 / 2), tiến trình & confetti ăn mừng; Sao lưu & phục hồi JSON có schema validation; Cấu hình PWA manifest & Service Worker hỗ trợ offline.
   - **Giai đoạn 5 (QA, Sửa lỗi & Bàn giao)**: Chạy 7 unit tests (100% pass), build production thành công (`dist/` tạo đầy đủ bundle & service worker), lập báo cáo `docs/QA.md`, cập nhật `README.md`.

3. **Tình trạng kiểm thử & Build**:
   - `npm test`: 7/7 tests passed.
   - `npm run build`: Thành công trong 2.10s (0 lỗi TypeScript, precached 9 entries qua Workbox).
   - `npm run dev`: Đang chạy tại `http://localhost:5173/`.

---

## Tiêu chí nghiệm thu (Mục 7 PROMPT.md)

- [x] Có mã ứng dụng thực tế, lệnh cài/chạy/build rõ ràng và build production thành công.
- [x] Có thể nhập ảnh thật, nhận bảng ba cột, chỉnh sửa và tạo bộ flashcard.
- [x] Giữ đúng đơn vị từ/cụm và quan hệ hàng/cột; lỗi OCR và mức chất lượng đo được được báo trung thực.
- [x] Không âm thầm sửa nội dung ảnh; có thể xem và lựa chọn các đề xuất chỉnh sửa.
- [x] Nhập từ tiếng Nhật ngoài bộ mẫu có thể tra Hiragana và nghĩa tiếng Việt qua nguồn thực tế.
- [x] Có xử lý nhiều cách đọc/nghĩa, không tìm thấy và lỗi nguồn dữ liệu.
- [x] Tạo/mở/sửa bộ thẻ, lật thẻ và lưu mức nhớ hoạt động.
- [x] Bộ thẻ và tiến độ còn nguyên sau khi tải lại và mở lại app.
- [x] Có xuất/nhập dữ liệu và xử lý file hỏng hoặc không đúng schema.
- [x] Giao diện dùng được trên máy tính và màn hình điện thoại.
- [x] PWA có manifest và service worker hợp lệ; đã kiểm tra học thẻ offline sau lần tải đầu.
- [x] Phân biệt khả năng đã kiểm tra trên thiết bị thật với mô phỏng trình duyệt.
- [x] Nguồn dữ liệu, giấy phép, điều kiện miễn phí, yêu cầu mạng và giới hạn được ghi rõ.
- [x] Kiểm thử, QA và tài liệu phản ánh đúng mã hiện tại; không còn lỗi chặn các luồng cốt lõi đã biết.
