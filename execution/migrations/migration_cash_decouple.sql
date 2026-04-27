-- [Pending Refactor #3] System Cash Decoupling
-- Thêm cờ để hệ thống nhận diện đây là tài khoản tiền mặt dùng cho điều chỉnh tự động
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_system_cash_account BOOLEAN DEFAULT FALSE;

-- Cập nhật row "Tiền mặt" hiện tại (nếu có)
UPDATE assets 
SET is_system_cash_account = TRUE 
WHERE name = 'Tiền mặt' AND type = 'FINANCE';
