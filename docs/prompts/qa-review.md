# Prompt con: QA / Reviewer

## 1. Mục tiêu cụ thể và phạm vi

- **Mục tiêu**:
  - Đảm bảo chất lượng toàn diện của ứng dụng Kanji Flashcard PWA trước khi bàn giao.
  - Xây dựng hệ thống unit tests và integration tests tự động với `vitest`.
  - Kiểm thử các ca biên (edge cases), bảo đảm tính toàn vẹn dữ liệu:
    - Thuật toán phân tách cột và ghép hàng OCR.
    - Module tra cứu từ điển (từ đơn, từ ghép, okurigana, từ không tồn tại, đa nghĩa).
    - Phát hiện thẻ trùng lặp khi thêm vào bộ thẻ.
    - Xuất và nhập JSON: file rỗng, file sai định dạng, file thiếu trường, phục hồi dữ liệu.
    - Lưu trữ IndexedDB và khôi phục khi tải lại trang.
  - Thực hiện kiểm thử thủ công và ghi nhận chi tiết vào `docs/QA.md`:
    - Đo lường thực tế trên ảnh mẫu `local-data/reference_image.jpg`.
    - Kiểm tra responsiveness trên desktop và mobile viewports (375px, 390px, 412px, 768px, 1280px).
    - Kiểm tra PWA audit (Lighthouse PWA, Service Worker, Web Manifest, Offline status).
    - Kiểm tra accessibility (a11y: label, aria, keyboard navigation).
- **Không thuộc phạm vi**:
  - Không thay đổi mã logic nghiệp vụ chính (nếu phát hiện lỗi, tạo bug report và phối hợp với Developer tương ứng).

## 2. Tài liệu, file đầu vào và hợp đồng dữ liệu

- **Tài liệu tham chiếu**:
  - Tiêu chí nghiệm thu tại Mục 7 trong `PROMPT.md`.
  - Ảnh tham chiếu `local-data/reference_image.jpg` và bảng dữ liệu chuẩn 15 hàng trong Mục 4 `PROMPT.md`.
  - Hợp đồng dữ liệu `src/types/`.

## 3. Phân vùng file và trách nhiệm

- **Được toàn quyền phụ trách**:
  - `src/__tests__/` (các file test unit và integration).
  - `docs/QA.md` (báo cáo kiểm thử chi tiết, số liệu đo lường, checklist nghiệm thu).
- **File dùng chung**:
  - Đề xuất sửa đổi nếu phát hiện bug trong `src/`.

## 4. Phụ thuộc, giả định và tài nguyên

- Thư viện kiểm thử: `vitest` và `@testing-library/react` (nếu cần test component).
- Trình duyệt và DevTools để kiểm tra responsive, offline và Lighthouse.

## 5. Các bước triển khai và tiêu chí hoàn thành

1. **Bước 1**: Thiết lập cấu hình test với `vitest`.
2. **Bước 2**: Viết bộ test cho OCR Row-Segmenter & Table parser.
3. **Bước 3**: Viết bộ test cho Dictionary Service (tra từ đơn, từ ghép, từ không tồn tại, gợi ý).
4. **Bước 4**: Viết bộ test cho Storage & Backup Service (Import/Export JSON validation, duplicate handling).
5. **Bước 5**: Chạy test và đo lường độ chính xác trên ảnh tham chiếu `local-data/reference_image.jpg`.
6. **Bước 6**: Lập báo cáo `docs/QA.md` ghi nhận:
   - Danh sách lệnh test đã chạy và tỷ lệ pass.
   - Bảng so sánh 15 hàng của ảnh tham chiếu (kết quả đọc thực tế vs ảnh gốc).
   - Danh sách từ đã thử nghiệm tra cứu thực tế.
   - Bằng chứng kiểm thử offline và PWA.
   - Các hạn chế và lưu ý cho người dùng.

## 6. Cách báo cáo kết quả

- Tổng số test case, số test pass/fail.
- Độ chính xác OCR trên 15 hàng mẫu (tỷ lệ Kanji đúng, Hiragana đúng, Nghĩa đúng).
- Trạng thái các tiêu chí nghiệm thu theo Mục 7 của `PROMPT.md`.
