# Kế hoạch Hoàn thiện Trang Cài Đặt (Settings)

Kế hoạch này nhằm xây dựng một trang Cài Đặt và Quản lý dữ liệu hoàn chỉnh, đáp ứng việc thiết lập chỉ tiêu tài chính và sao lưu dữ liệu an toàn.

## User Review Required

> [!WARNING]
> **Nhập dữ liệu (Import)**: Khi Import file JSON, phương án an toàn nhất là **xóa sạch** dữ liệu cũ (transactions, assets, debts) và chèn lại dữ liệu từ file để tránh các xung đột khó sửa chữa. Em cần anh xác nhận xem cách này có ổn không, hay anh muốn bổ sung thêm dữ liệu thay vì ghi đè?

> [!IMPORTANT]  
> Các chỉ số "Thu nhập mục tiêu" và "Ngân sách chi tiêu" hiện tại sẽ được áp dụng chung cho mức độ **Gia đình** (Family-wide). Nếu anh muốn cài đặt riêng chỉ tiêu cho tính năng phân tách (chỉ tiêu của Hiếu riêng, của Ly riêng) thì cần báo cho em biết.

## Proposed Changes

---

### Database Update (Supabase)

#### [NEW] `app_settings` Table
- Sẽ chạy một script tạo bảng (SQL) trên Supabase để chứa các cấu hình hệ thống:
  - `owner` (ENUM: 'HIEU', 'LY', 'ALL' - Mặc định dùng 'ALL' cho cả gia đình)
  - `target_income` (Decimal)
  - `target_spending` (Decimal)
  - `updated_at` (Timestamp)

---

### Backend Logic & APIs

#### [NEW] [settings.ts](file:///d:/AI/bctcgd/src/lib/actions/settings.ts)
- Viết Server Actions để lấy ra và lưu lại thông tin `app_settings`.
- Viết hàm `exportDatabase()`: Truy xuất toàn bộ bảng từ DB và gói vào một file dạng String JSON (Bao gồm categories, debts, assets, transactions).
- Viết hàm `importDatabase(jsonData)`: Xử lý chuỗi JSON, clear dữ liệu cũ (nếu được anh đồng ý) và insert khối dữ liệu mới.

---

### Giao Diện Cài Đặt (Settings UI)

#### [NEW] [page.tsx](file:///d:/AI/bctcgd/src/app/settings/page.tsx) & [settings-client.tsx](file:///d:/AI/bctcgd/src/app/settings/settings-client.tsx)
- Xây dựng layout Settings (phong cách Dark Mode / Neon hiện đại giống các trang khác).
- **Tab Cài đặt**:
  - Input "Thu nhập mục tiêu" có áp dụng tự động phân cách hàng ngàn số tiền (giống form Assets).
  - Input "Ngân sách chi tiêu" có áp dụng định dạng hàng ngàn.
  - Button "Lưu cài đặt".
- **Tab Sao lưu**:
  - Giao diện Card "Xuất dữ liệu": Có text icon giải thích, bấm tải về một file `bctcgd_backup_YYYYMMDD.json`.
  - Giao diện Card "Khôi phục dữ liệu": Có thẻ input file (chấp nhận `.json`). Khi chọn sẽ hiện bảng xác nhận (Dialog) nhắc nhở về việc dữ liệu cũ sẽ bị thay thế, nếu bấm XÁC NHẬN thì tiến hành import.

---

### Tích Hợp Giao Diện Hiện Tại

#### [MODIFY] [page.tsx](file:///d:/AI/bctcgd/src/app/page.tsx)
- Connect hàm `getSettings()` vào trang Homepage.
- Truyền thông số `target_income` và `target_spending` vào thẻ thu nhập / chi tiêu để thay thế các con số cứng (hard-coded) tính % trên trang chủ.

## Open Questions

1. Việc kết nối tới Supabase để Import lại toàn bộ cơ sở dữ liệu sẽ rất phức tạp vì tính toàn vẹn phụ thuộc (Khóa ngoại: Category -> Transaction, Asset -> Transaction). Anh có muốn backup luôn cả bảng `categories` hay `categories` sẽ được fix cứng mặc định?
2. Trong trang chủ hiện tại, các khối Thu nhập và Chi tiêu anh muốn hiển thị theo dạng thanh Progress bar so sánh Thực Tế/Mục tiêu không?

## Verification Plan

### Automated Tests
- Kiểm tra nhập liệu chuỗi JSON sai cú pháp ở nút Import để xem lỗi có bị nhốt (catch) để xử lý không. 
- Log kết quả của hàm Upload settings đảm bảo dữ liệu ghi đúng xuống DB.

### Manual Verification
- Render trang cài đặt, nhập dữ liệu tiền lưu lại xem có lưu trên DB không.
- Sang trang chủ xem Progress có cập nhật không.
- Tải file JSON xuống, xóa một Asset, up JSON lên, kiểm tra xem Asset cũ đã quay về chưa.
