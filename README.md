# KanjiFlash — Ứng dụng Flashcard Học Từ Vựng Tiếng Nhật PWA

Ứng dụng Flashcard học từ vựng tiếng Nhật thông minh cho người Việt, hoạt động trên nền tảng Web và thiết bị di động (Android / iOS) thông qua Progressive Web App (PWA).

---

## 🌟 Chức năng nổi bật

### 1. Nhập ảnh bảng từ vựng (Client-side OCR)
- Nhận diện trực tiếp trên trình duyệt bằng **Tesseract.js** (không cần gửi ảnh lên server cá nhân, bảo mật dữ liệu tuyệt đối).
- Tách chính xác bảng 3 cột: **Từ tiếng Nhật (Kanji/cụm từ) – Hiragana – Nghĩa tiếng Việt có dấu**.
- Giữ nguyên các cụm từ (ví dụ `都合がいい`), không bị cắt vụn ký tự.
- Cho phép chỉnh sửa từng ô, thêm/xóa dòng, chọn hoặc bỏ chọn hàng trước khi lưu vào bộ thẻ.
- **Minh bạch chất lượng**: Giữ nguyên bản chép gốc từ ảnh và hiển thị cảnh báo khi nghĩa trong ảnh khác với từ điển chuẩn (ví dụ trường hợp `涼しい` = ấm áp / `低い` = nhẹ).

### 2. Tra cứu từ đơn tiếng Nhật thông minh
- Nhập từ hoặc cụm từ tiếng Nhật (Kanji, Kana, Romaji).
- **Kiến trúc Hybrid**:
  - Tra cứu tức thì trong bộ từ điển ngoại tuyến tích hợp sẵn (JMdict N5-N3).
  - Tra cứu mở rộng qua Mazii API trực tuyến khi có kết nối Internet.
- Hỗ trợ từ nhiều cách đọc (ví dụ chữ `生` cho ra `なま`, `せい`, `うまれる`...) và nhiều tầng nghĩa tiếng Việt cho người học tự chọn.
- Hỗ trợ phương án nhập/sửa tay khi từ chưa có trong từ điển.

### 3. Học Flashcard & Quản lý bộ thẻ
- Tạo, đổi tên, xóa và phân loại các bộ thẻ theo chủ đề học tập.
- **Thẻ 3D Flip trực quan**: Mặt trước hiển thị chữ Hán to rõ, chạm hoặc nhấn `Space` để lật xem Hiragana và nghĩa tiếng Việt.
- **Hệ thống đánh giá ghi nhớ**: Đánh dấu "Chưa nhớ" (Phím `1`) hoặc "Đã nhớ" (Phím `2`).
- Thống kê tỷ lệ thuộc bài, hiệu ứng ăn mừng (`confetti`) và tùy chọn ôn tập lại các thẻ chưa nhớ.

### 4. Lưu trữ bền vững & Hoạt động Ngoại tuyến (PWA)
- Lưu trữ toàn bộ trên thiết bị qua **IndexedDB**: Dữ liệu không bị mất khi tải lại trang hoặc đóng trình duyệt.
- Hỗ trợ **Sao lưu & Phục hồi JSON**: Xuất/nhập file sao lưu kèm kiểm tra schema nghiêm ngặt, xử lý từ trùng lặp an toàn.
- **PWA Standalone**: Có thể "Thêm vào màn hình chính" (Add to Home Screen) trên iPhone và Android; ôn tập các bộ thẻ đã lưu hoàn toàn khi mất mạng.

---

## 🛠 Yêu cầu môi trường & Cài đặt

- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị Node.js 20 hoặc 24).
- **Trình duyệt**: Chrome, Edge, Safari, Firefox phiên bản hiện đại.

### Các lệnh thực thi:

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# 3. Chạy bộ kiểm thử tự động (Vitest)
npm test

# 4. Biên dịch bản phân phối Production
npm run build

# 5. Xem trước bản phân phối
npm run preview
```

---

## 📖 Hướng dẫn sử dụng nhanh

### Cách nhập bảng từ ảnh tham chiếu:
1. Mở ứng dụng, vào tab **Nhập liệu** -> **Nhập ảnh bảng (OCR)**.
2. Bấm nút **Chọn ảnh từ máy** (hoặc kéo thả ảnh bảng, hoặc bấm **Nạp ảnh tham chiếu mẫu**).
3. Đợi tiến trình quét hoàn tất 100%.
4. Kiểm tra dữ liệu tại **Bảng từ vựng xem trước** ở bên dưới. Sửa các ô nếu cần.
5. Chọn bộ thẻ đích và bấm **Lưu thẻ vào bộ**.

### Cách tra cứu từ đơn:
1. Vào tab **Nhập liệu** -> **Tra từ đơn tiếng Nhật**.
2. Nhập từ cần tra (ví dụ: `学校`, `生`, `食べる`) và bấm **Tra cứu**.
3. Chọn cách đọc và nghĩa tiếng Việt ưng ý, sau đó bấm **Thêm vào bảng xem trước**.
4. Chọn bộ thẻ và bấm **Lưu thẻ vào bộ**.

### Cài đặt PWA lên điện thoại:
- **Trên iOS (Safari)**: Bấm biểu tượng Chia sẻ (Share) -> chọn **Thêm vào MH chính (Add to Home Screen)**.
- **Trên Android (Chrome)**: Bấm menu 3 chấm -> chọn **Cài đặt ứng dụng** hoặc **Thêm vào màn hình chính**.

---

## 📚 Nguồn dữ liệu & Giấy phép

- **OCR Engine**: Tesseract.js ([Apache License 2.0](https://github.com/naptha/tesseract.js/blob/master/LICENSE)).
- **Dữ liệu từ điển ngoại tuyến**: Tổng hợp từ JMdict thuộc bản quyền của Electronic Dictionary Research and Development Group (EDRDG), sử dụng theo giấy phép [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](http://www.edrdg.org/edrdg/licence.html).
- **Dữ liệu trực tuyến**: Mazii Open Search API.
- Chi tiết xem tại [docs/DATA_SOURCES.md](file:///c:/Users/Lenovo/Documents/Flashcard/docs/DATA_SOURCES.md).

---

## ⚠️ Giới hạn & Lưu ý

1. **Lần chạy OCR đầu tiên**: Trình duyệt sẽ tải model dữ liệu ngôn ngữ Tesseract (`jpn` ~15MB và `vie` ~2MB). Trình duyệt sẽ tự động cache lại cho các lần quét tiếp theo.
2. **Chế độ Ngoại tuyến**: Chức năng học flashcard và tra từ điển N5-N3 hoạt động 100% khi mất mạng. Chức năng tra từ nâng cao ngoài kho dữ liệu cục bộ yêu cầu kết nối Internet.
3. **Dữ liệu lưu trữ**: Dữ liệu lưu cục bộ trên trình duyệt thiết bị. Hãy định kỳ sử dụng chức năng **Sao lưu JSON** để bảo vệ dữ liệu học tập của bạn.
