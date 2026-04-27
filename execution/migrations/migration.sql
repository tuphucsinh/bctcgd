-- Bước 1: Cập nhật các giao dịch (transactions) có owner = 'JOINT' chuyển thành mặc định (vd 'HIEU')
-- Giao dịch không thể không có owner (nếu giữ nguyên logic bắt buộc)
UPDATE transactions SET owner = 'HIEU' WHERE owner = 'JOINT';

-- Bước 2: Xoá cột owner khỏi bảng debts và assets
ALTER TABLE debts DROP COLUMN IF EXISTS owner;
ALTER TABLE assets DROP COLUMN IF EXISTS owner;

-- Bước 3: Đổi kiểu ENUM owner_type bỏ đi JOINT
-- Cách an toàn trên Postgres: Tạo type mới, chuyển đổi data, drop type cũ, rename type mới
CREATE TYPE owner_type_new AS ENUM ('HIEU', 'LY');

-- Xóa mặc định (bỗng dưng sẽ lỗi nếu default là JOINT)
ALTER TABLE transactions ALTER COLUMN owner DROP DEFAULT;

-- Ép kiểu dữ liệu sang type mới
ALTER TABLE transactions 
  ALTER COLUMN owner TYPE owner_type_new 
  USING owner::text::owner_type_new;

-- Xóa bảng type cũ và đổi tên type mới về chuẩn
DROP TYPE owner_type;
ALTER TYPE owner_type_new RENAME TO owner_type;
