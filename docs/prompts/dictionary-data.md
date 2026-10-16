# Prompt con: Dictionary / Data Developer

## 1. Mục tiêu cụ thể và phạm vi

- **Mục tiêu**:
  - Xây dựng module tra cứu từ điển Nhật - Việt phục vụ luồng nhập từ đơn: Nhập từ có Kanji -> Tự động gợi ý Hiragana & Nghĩa tiếng Việt.
  - Hỗ trợ đầy đủ:
    - Từ đơn Kanji, từ ghép Kanji (`学校`, `先生`).
    - Từ có đuôi Hiragana (okurigana: `白い`, `涼しい`, `強い`).
    - Cụm từ và thành ngữ (`都合がいい`).
    - Phân biệt đa cách đọc và đa nghĩa (ví dụ `生` -> seikatsu, nama, umareru...; `涼しい` -> mát mẻ; `低い` -> thấp/nhẹ).
  - Kiến trúc Hybrid:
    - **Offline Dataset**: Bộ từ điển cục bộ (khoảng 1500-3000 từ vựng N5-N3 phổ biến + các từ trong bảng tham chiếu) được đóng gói sẵn trong app để chạy được khi mất mạng.
    - **Online API Provider**: Adapter kết nối nguồn mở (như Mazii API hoặc Jisho + từ điển đối chiếu) khi có mạng để tra cứu từ nâng cao ngoài kho cục bộ.
- **Không thuộc phạm vi**:
  - Không tự bịa nghĩa hoặc dùng timer giả lập tra từ.
  - Không chỉ trả nghĩa tiếng Anh khi người dùng yêu cầu nghĩa tiếng Việt.
  - Không vi phạm bản quyền dữ liệu (phải ghi nhận nguồn, giấy phép trong `docs/DATA_SOURCES.md`).

## 2. Tài liệu, file đầu vào và hợp đồng dữ liệu

- **Tài liệu tham chiếu**:
  - Danh mục từ vựng trong mục 4 `PROMPT.md`.
  - Các trường hợp đặc biệt: `涼しい` (nghĩa phổ biến "mát mẻ", ảnh ghi "ấm áp"), `低い` (nghĩa phổ biến "thấp", ảnh ghi "nhẹ"), `生` (nhiều cách đọc on/kun).
- **Hợp đồng dữ liệu (`src/types/dictionary.ts`)**:
  ```typescript
  export interface DictionarySense {
    meaningVi: string;
    glossary?: string[];
    partOfSpeech?: string[];
    examples?: { ja: string; vi: string }[];
  }

  export interface DictionaryEntry {
    kanji: string;
    reading: string; // Hiragana
    senses: DictionarySense[];
    romaji?: string;
    jlptLevel?: string; // e.g. "N5", "N4"
    source: 'local' | 'online_api' | 'user_manual';
  }

  export interface LookupResult {
    query: string;
    exactMatches: DictionaryEntry[];
    suggestions: DictionaryEntry[];
    sourceInfo: string;
  }

  export interface DictionaryService {
    lookup(query: string): Promise<LookupResult>;
    getSuggestions(prefix: string): Promise<string[]>;
  }
  ```

## 3. Phân vùng file và trách nhiệm

- **Được toàn quyền phụ trách**:
  - `src/services/dictionary/` (offline dataset, online adapter, parser, cache).
  - `docs/DATA_SOURCES.md` (ghi công, nguồn gốc, giấy phép).
  - Dữ liệu từ điển offline dạng JSON nén / cấu trúc tối ưu cho bundle size.
- **File dùng chung (chỉ đề xuất)**:
  - `src/types/dictionary.ts`.

## 4. Phụ thuộc, giả định và tài nguyên

- Cần nguồn dữ liệu từ điển Nhật - Việt nguồn mở:
  - Dữ liệu JMdict phiên bản tiếng Việt (EDRDG license) hoặc bộ dữ liệu từ vựng JLPT N5-N1 Nhật-Việt nguồn mở (CC BY-SA).
  - Endpoint tìm kiếm công khai hoặc fetch fallback an toàn (có xử lý CORS và rate-limit).
- Tối ưu kích thước bundle: file JSON từ điển offline phải nhẹ (< 1MB) hoặc load async/dynamic import để không làm chậm khởi động app.

## 5. Các bước triển khai và tiêu chí hoàn thành

1. **Bước 1**: Chuẩn bị dataset từ điển offline chất lượng cao cho các từ thông dụng (bao gồm 15 từ mẫu, các từ JLPT N5-N3 cơ bản).
2. **Bước 2**: Xây dựng `LocalDictionaryProvider` tìm kiếm theo Kanji, Hiragana và Romaji.
3. **Bước 3**: Xây dựng `OnlineDictionaryProvider` (kết nối API tra từ Nhật - Việt mở, có fallback an toàn).
4. **Bước 4**: Xây dựng `HybridDictionaryService` kết hợp: tra local trước -> nếu thiếu hoặc người dùng yêu cầu mở rộng thì gọi online provider -> cache kết quả vào IndexedDB.
5. **Tiêu chí hoàn thành**:
   - Tra được tất cả các từ trong ảnh mẫu (`白い`, `涼しい`, `都合がいい`, `太い`, v.v.).
   - Tra được các từ ngoài ảnh mẫu (`学校`, `日本語`, `食べる`).
   - Xử lý từ nhiều cách đọc (`生`, `日`, `行`).
   - Xử lý mượt mà khi không tìm thấy từ (báo rõ ràng, cho phép sửa tay).
   - Hoàn tất tài liệu `docs/DATA_SOURCES.md`.

## 6. Cách báo cáo kết quả

- Danh sách nguồn dữ liệu, giấy phép và hạn mức.
- Kết quả test tra cứu trên tập từ kiểm tra.
- Dung lượng file dữ liệu offline và thời gian tra cứu trung bình.
