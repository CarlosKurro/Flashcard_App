# Nguồn dữ liệu & Giấy phép sử dụng (Data Sources & Licenses)

Dự án **Kanji Flashcard PWA** cam kết tuân thủ các quy định về giấy phép dữ liệu và ghi nhận công trạng rõ ràng cho các nguồn dữ liệu bên thứ ba:

---

## 1. Dữ liệu Từ điển Ngoại tuyến (Built-in Offline Dictionary)

- **Nguồn gốc**: Tổng hợp từ dữ liệu JMdict (phiên bản Việt ngữ) và bộ từ vựng JLPT N5 - N3 nguồn mở.
- **Giấy phép**: 
  - JMdict thuộc bản quyền của **Electronic Dictionary Research and Development Group (EDRDG)**, sử dụng theo giấy phép **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.
  - URL tham chiếu: [http://www.edrdg.org/edrdg/licence.html](http://www.edrdg.org/edrdg/licence.html).
- **Phạm vi sử dụng**:
  - Đóng gói trong ứng dụng làm cơ sở dữ liệu ngoại tuyến (offline) cho các từ vựng tiếng Nhật thông dụng.
  - Cho phép tra cứu cách đọc (Hiragana) và nghĩa tiếng Việt cơ bản mà không cần kết nối mạng.

---

## 2. Dịch vụ Tra cứu Trực tuyến (Online Dictionary Provider)

- **Nguồn cung cấp**: Mazii Open Search API (`https://mazii.net`).
- **Giao thức**: REST API qua HTTPS với header CORS công khai (`Access-Control-Allow-Origin: *`).
- **Hạn mức & Giới hạn**:
  - Miễn phí cho các truy vấn tra cứu từ vựng thông thường.
  - Cần kết nối Internet khi tra cứu các từ vựng nâng cao ngoài bộ dữ liệu offline.
  - Khi không có mạng hoặc dịch vụ bận, ứng dụng tự động chuyển về bộ từ điển ngoại tuyến hoặc cho phép nhập/sửa tay.

---

## 3. Thư viện Nhận diện Quang học Ký tự (OCR Engine)

- **Thư viện**: `Tesseract.js` (JavaScript port của engine OCR mã nguồn mở Tesseract của HP/Google).
- **Giấy phép**: **Apache License 2.0**.
- **Model dữ liệu huấn luyện (Tessdata)**:
  - `jpn` (Japanese language data) & `vie` (Vietnamese language data).
  - Tải về từ kho lưu trữ chính thức `tessdata` (Apache 2.0).
  - Được lưu vào cache của trình duyệt sau lần tải đầu tiên để tiết kiệm băng thông.
