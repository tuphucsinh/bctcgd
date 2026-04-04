-- 1. Xóa toàn bộ dữ liệu có owner là JOINT (để reset hệ thống theo yêu cầu)
DELETE FROM public.transactions WHERE owner = 'JOINT';
DELETE FROM public.debts WHERE owner = 'JOINT';
-- Lưu ý: Bảng assets cũng có thể có owner tùy thiết kế, nhưng ở schema hiện tại owner chỉ có ở transactions và debts.
-- (Nếu có các bảng khác có owner JOINT thì thêm vào đây)

-- 2. Cập nhật default value cho cột owner (chuyển từ JOINT sang HIEU hoặc NULL)
-- Ở đây em chọn bỏ default để app luôn phải xác định rõ là Hiếu hay Ly khi insert.
ALTER TABLE public.transactions ALTER COLUMN owner DROP DEFAULT;
-- Hoặc nếu anh muốn mặc định là Hiếu:
-- ALTER TABLE public.transactions ALTER COLUMN owner SET DEFAULT 'HIEU';

-- 3. Thêm check constraint để ngăn chặn việc ghi thêm dữ liệu JOINT từ DB level
ALTER TABLE public.transactions ADD CONSTRAINT check_owner_no_joint CHECK (owner IN ('HIEU', 'LY'));
ALTER TABLE public.debts ADD CONSTRAINT check_owner_no_joint_debt CHECK (owner IN ('HIEU', 'LY'));
