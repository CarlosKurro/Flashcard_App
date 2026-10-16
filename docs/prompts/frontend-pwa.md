# Prompt con: Frontend / PWA Developer

## 1. Mục tiêu cụ thể và phạm vi

- **Mục tiêu**:
  - Xây dựng giao diện web ứng dụng hiện đại, trải nghiệm mượt mà, chuẩn PWA cho Mobile và Desktop.
  - Áp dụng triệt để các nguyên tắc thiết kế thẩm mỹ cao:
    - Bảng màu hài hòa, sang trọng (dark/light theme cao cấp, typography tiếng Nhật & tiếng Việt tinh tế).
    - Hiệu ứng chuyển động vi mô (micro-animations), lật thẻ 3D mượt mà, glassmorphism tinh tế.
    - Không tràn ngang màn hình trên thiết bị di động (320px - 430px).
  - Triển khai các màn hình chính:
    1. **Màn hình Nhập liệu (Input Hub)**:
       - Tab 1: Nhập ảnh bảng từ vựng (kéo thả, chọn tệp, dán clipboard, chụp ảnh) + Thanh tiến trình OCR + Bảng chỉnh sửa 3 cột (sửa ô, thêm/xóa dòng, checkbox chọn dòng, đánh dấu cảnh báo).
       - Tab 2: Nhập từ đơn tiếng Nhật -> Autocomplete/Gợi ý tra từ tức thì -> Chọn cách đọc & nghĩa -> Thêm vào bảng xem trước.
    2. **Màn hình Quản lý Bộ thẻ (Deck Management)**:
       - Danh sách bộ thẻ, số lượng thẻ, tỷ lệ đã thuộc, tạo bộ thẻ mới, đổi tên, xóa.
       - Xuất / Nhập JSON sao lưu và phục hồi an toàn.
    3. **Màn hình Học Flashcard (Study Mode)**:
       - Thẻ 3D flip (phím cách, click hoặc swipe).
       - Mặt trước: Từ tiếng Nhật (Kanji lớn, font đẹp).
       - Mặt sau: Hiragana + Nghĩa tiếng Việt.
       - Hai nút đánh giá: "Chưa nhớ" (Đỏ/Cam) và "Đã nhớ" (Xanh lá).
       - Tiến trình học, thanh tiến độ, màn hình tổng kết khi hoàn thành bộ thẻ.
  - Cấu hình PWA:
    - Web Manifest đầy đủ icon các cỡ, theme color, display standalone.
    - Service Worker hỗ trợ Offline App Shell và Offline Study.
- **Không thuộc phạm vi**:
  - Không triển khai hệ thống đăng nhập/tài khoản backend (bản đầu lưu local IndexedDB).
  - Không tự ý thay đổi data contracts đã thống nhất.

## 2. Tài liệu, file đầu vào và hợp đồng dữ liệu

- **Hợp đồng dữ liệu (`src/types/flashcard.ts`)**:
  ```typescript
  export interface Flashcard {
    id: string;
    deckId: string;
    kanji: string;
    reading: string;
    meaning: string;
    notes?: string;
    status: 'not_memorized' | 'memorized';
    reviewCount: number;
    lastReviewedAt?: number;
    createdAt: number;
  }

  export interface Deck {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
    cardsCount?: number;
    memorizedCount?: number;
  }

  export interface BackupData {
    version: number;
    exportedAt: string;
    decks: Deck[];
    cards: Flashcard[];
  }
  ```

## 3. Phân vùng file và trách nhiệm

- **Được toàn quyền phụ trách**:
  - `src/components/` (các UI components tái sử dụng).
  - `src/views/` (màn hình Dashboard, ImageInput, WordInput, DeckList, StudySession).
  - `src/storage/` (IndexedDB database wrapper bằng `idb` hoặc native API).
  - `src/styles/` (CSS design tokens, theme, typography, animations).
  - Cấu hình PWA (`vite-plugin-pwa`, `public/manifest.json`, icons).
- **File dùng chung**:
  - `src/App.tsx`, `src/types/index.ts`.

## 4. Phụ thuộc, giả định và tài nguyên

- Sử dụng React 18/19, TypeScript, Vite.
- Icon: `lucide-react`.
- Lưu trữ: `idb` (IndexedDB promise wrapper).
- PWA: `vite-plugin-pwa`.
- Hiệu ứng: CSS 3D Transforms cho lật thẻ, `canvas-confetti` khi hoàn thành bài học.

## 5. Các bước triển khai và tiêu chí hoàn thành

1. **Bước 1**: Thiết lập hệ thống Design System (`index.css`) với color tokens, modern typography, card styles, focus states, responsive utility.
2. **Bước 2**: Xây dựng tầng Storage với IndexedDB (`src/storage/db.ts`) quản lý `decks` và `cards`.
3. **Bước 3**: Xây dựng UI Bảng chỉnh sửa 3 cột với đầy đủ tính năng: sửa inline, thêm/xóa dòng, chọn hàng, cảnh báo nghĩa.
4. **Bước 4**: Xây dựng UI Nhập ảnh và UI Tra từ đơn kết nối với các Service tương ứng.
5. **Bước 5**: Xây dựng UI Học Flashcard với lật thẻ 3D, phím tắt (Space, 1: Chưa nhớ, 2: Đã nhớ), thanh tiến độ.
6. **Bước 6**: Xây dựng tính năng Xuất/Nhập JSON có validate schema kỹ lưỡng.
7. **Bước 7**: Cấu hình PWA (Manifest, Service Worker, Offline Caching).
8. **Tiêu chí hoàn thành**:
   - Giao diện đẹp, chuyên nghiệp, responsive hoàn hảo trên cả 375px và 1920px.
   - Thao tác sửa bảng mượt mà, không bị lag khi nhập liệu.
   - Tải lại trang giữ nguyên 100% dữ liệu đã lưu.
   - Hoạt động offline khi học flashcard sau lần tải đầu tiên.

## 6. Cách báo cáo kết quả

- Danh sách các màn hình và components đã hoàn thành.
- Đánh giá khả năng responsive và kiểm tra trên DevTools mobile emulations.
- Trạng thái cài đặt PWA và offline mode.
