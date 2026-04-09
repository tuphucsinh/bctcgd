# Kế hoạch Thực hiện: Trang Cài Đặt (Settings)

- [/] 1. Cập nhật Database:
  - [ ] Thêm bảng `app_settings` (id, user_id, target_income, target_spending, updated_at).
- [ ] 2. Xây dựng Server Actions (`settings.ts`):
  - [ ] Hàm `getSettings()` & `updateSettings(data)`.
  - [ ] Hàm `exportDatabase()`: Truy xuất toàn bộ data dạng JSON.
  - [ ] Hàm `importDatabase(json)`: Xóa dữ liệu cũ, chèn dữ liệu mới (với transaction an toàn).
- [ ] 3. Xây dựng Giao diện Trang Cài Đặt:
  - [ ] Giao diện chia 2 Tab (Cài đặt / Sao lưu).
  - [ ] Tính năng Tab Cài đặt (Input có format hàng ngàn, Nút lưu).
  - [ ] Tính năng Tab Sao lưu (Nút Export JSON, Nút Import JSON kèm Alert nhắc nhở xác nhận ghi đè).
- [ ] 4. Tích hợp Trang Chủ:
  - [ ] Lấy `target_income` và `target_spending` đưa vào mục tiêu % trên `src/app/page.tsx`.
