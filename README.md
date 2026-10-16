# Kanji Flashcard

Ứng dụng flashcard học từ vựng tiếng Nhật, hướng tới sử dụng trên web và điện thoại qua PWA.

## Trạng thái

Repo mới được khởi tạo. Chưa có mã ứng dụng hoặc lệnh chạy; công nghệ và nguồn dữ liệu sẽ được kiểm chứng ở bước triển khai.

## Chức năng đã thống nhất

### Nhập từ ảnh

- Người học chọn ảnh bảng từ vựng gồm ba cột: từ tiếng Nhật, Hiragana và nghĩa tiếng Việt.
- Nhận diện chữ bằng OCR và ghép các ô theo đúng từng hàng.
- Giữ nguyên từ hoặc cụm từ, ví dụ `都合がいい`, thay vì tách riêng từng ký tự Kanji.
- Hiển thị bảng kết quả có thể chỉnh sửa trước khi tạo flashcard.
- Giữ nội dung gốc khi đề xuất sửa cách đọc hoặc nghĩa; để người học xem và lựa chọn.

### Nhập từ tiếng Nhật

- Người học nhập một từ tiếng Nhật.
- Tra cứu để bổ sung Hiragana và nghĩa tiếng Việt.
- Cho phép lựa chọn khi từ có nhiều cách đọc hoặc nhiều nghĩa.
- Cho phép sửa kết quả trước khi lưu thành flashcard.

## Hướng kỹ thuật dự kiến

- React, TypeScript và Vite cho giao diện thích ứng với máy tính và điện thoại.
- PWA để hỗ trợ thêm ứng dụng vào màn hình chính và học ngoại tuyến.
- Thử nghiệm Tesseract.js cho OCR ngay trên trình duyệt.
- Ưu tiên lưu dữ liệu trên thiết bị ở bản đầu; xem xét tài khoản và đồng bộ sau.
- Chọn nguồn từ điển Nhật–Việt sau khi kiểm tra độ phủ, chất lượng và giấy phép.

Đây là các hướng dự kiến, chưa phải các chức năng đã được triển khai.

## Các điểm cần kiểm chứng

- Chất lượng OCR tiếng Nhật và dấu tiếng Việt trên ảnh thực tế.
- Khả năng ghép hàng, cột khi ảnh lệch, mờ hoặc có bố cục khác nhau.
- Phân biệt lỗi nhận diện với lỗi có sẵn trong tài liệu nguồn.
- Độ phủ từ điển và cách xử lý từ chưa có dữ liệu, nhiều cách đọc hoặc nhiều nghĩa.
- Giới hạn dung lượng và băng thông của các dịch vụ miễn phí trước khi đưa lên mạng.

## Bước tiếp theo

1. Khởi tạo giao diện và bảng chỉnh sửa ba cột.
2. Thử OCR với ảnh mẫu và đánh giá kết quả.
3. Thử nguồn tra cứu cách đọc và nghĩa tiếng Việt.
4. Xây luồng tạo bộ thẻ và học flashcard.

## Quy ước

- Không đưa khóa API, tệp `.env` hoặc dữ liệu cá nhân vào Git.
- Thư mục `uploads/` và `local-data/` dành cho dữ liệu thử nghiệm cục bộ, được bỏ qua bởi Git.
- Chưa chọn giấy phép phát hành mã nguồn; sẽ bổ sung khi xác định cách chia sẻ dự án.
