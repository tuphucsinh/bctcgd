# Directive: BCTCGD Planning & Architecture

## Goal
Đảm bảo mọi thay đổi trong hệ thống BCTCGD (Backend, Frontend, Database) đều nhất quán, tối ưu và tuân thủ các logic tài chính cốt lõi.

## Inputs
- Yêu cầu tính năng mới từ người dùng.
- Trạng thái bộ nhớ dự án trong MemPalace.
- Cấu trúc database hiện tại (`supabase_schema.sql`).

## Workflow

### 1. Phân tích tác động (Impact Analysis)
- Kiểm tra tính toán Cashflow: Tính năng mới có làm thay đổi cách `assets` liên kết với `cash_history` không?
- Kiểm tra Quyền sở hữu (Ownership): Luôn đảm bảo `owner` (HIEU/LY) được truyền đúng từ Server-side.
- Kiểm tra Database: Có cần chạy migration không? Nếu có, phải chuẩn bị file `.sql` trong root.

### 2. Thiết kế giải pháp
- Ưu tiên: Next.js 15 Server Components + Supabase RPC.
- Hạn chế: Tránh gọi dữ liệu trực tiếp từ Client-side nếu không cần thiết.
- Tối ưu: Sử dụng lại các logic trong `directives/memory_management.md`.

### 3. Lập kế hoạch thực thi (Implementation Plan)
- Chia task thành 3 giai đoạn:
    1. Database/Backend (Schema, RPCs).
    2. Logic trung gian (Server actions, Hooks).
    3. Giao diện (Components, UI).

## Outputs
- Một bản kế hoạch chi tiết định dạng Markdown.
- Danh sách các file cần chỉnh sửa/tạo mới.
- Các đoạn code mẫu (nếu cần).

## Edge Cases
- Lỗi RLS: Luôn kiểm tra quyền truy cập của Service Role nếu tác vụ yêu cầu sửa dữ liệu người khác.
- Lỗi NaN: Xử lý giá trị mặc định cho các trường số (default 0).
