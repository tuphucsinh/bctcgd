# Kế hoạch sửa lỗi hệ thống BCTCGD

Em đã dùng công cụ lint và kiểm thử để rà soát hệ thống. Dưới đây là kế hoạch sửa lỗi chi tiết:

## 1. Lỗi Linting hiện tại (15 lỗi, 4 cảnh báo)
Các lỗi này chủ yếu tập trung vào việc sử dụng kiểu dữ liệu không chặt chẽ hoặc biến dư thừa:

- **src/app/assets/asset-client.tsx [Line 145]**: Sử dụng `any` trong interface `ChartTooltipProps`.
  - *Cách sửa*: Chuyển thành `Record<string, unknown>` hoặc định nghĩa type cụ thể cho payload để đảm bảo Type Safety.
- **src/app/page.tsx [Line 67]**: Biến `transactions` được khai báo nhưng không dùng.
  - *Cách sửa*: Xóa dòng khai báo này để làm gọn code.
- **Các file script gốc (root)**: `seed_expense.js`, `test_all_regions.js`, `test_pooler_obj.js`.
  - *Vấn đề*: Gặp lỗi `no-require-imports` do sử dụng `require` trong file JS (Eslint mặc định áp quy tắc TS).
  - *Cách sửa*: Thêm các file này vào `.eslintignore` vì đây là các script công cụ, không thuộc source code ứng dụng chính.

## 2. Kiểm thử UI & UX
Em đã lên kế hoạch kiểm tra lại các thay đổi về giao diện:

- **Xác minh hiệu ứng di chuyển**: Kiểm tra các component `SpotlightCard` trên Dashboard và trang Chi tiết để đảm bảo `noMovement={true}` hoạt động đúng (không còn hiệu ứng 3D khi hover).
- **Kiểm tra Responsive Modal**: Mở modal trên mobile và PC để đảm bảo các tab "Cập nhật" và "Bán" hiển thị cân đối, nút bấm dễ thao tác.
- **Biểu đồ**: Kiểm tra biểu đồ hình quạt (Pie chart) sau khi đã tăng kích thước, đảm bảo không bị tràn khung trên màn hình nhỏ.

## 3. Các bước thực hiện tiếp theo
1. **Cập nhật `.eslintignore`**: Loại bỏ các script rác khỏi quá trình kiểm tra.
2. **Refactor Type Safety**: Xử lý nốt các lỗi `any` còn lại trong `asset-client.tsx`.
3. **Dọn dẹp code**: Xóa các import và biến không sử dụng.

Em sẽ chờ lệnh của anh để bắt đầu triển khai các bước sửa lỗi này!
