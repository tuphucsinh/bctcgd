-- 1. Enum cho các trường phân loại
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_SELL');
CREATE TYPE owner_type AS ENUM ('HIEU', 'LY', 'JOINT');
CREATE TYPE asset_status AS ENUM ('ACTIVE', 'SOLD');
CREATE TYPE category_type AS ENUM ('INCOME', 'EXPENSE');

-- 2. Bảng Danh mục (Categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type category_type NOT NULL,
  icon TEXT, -- Dùng icon name (vd: 'car', 'home')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Bảng Nợ (Debts)
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  initial_principal DECIMAL(15, 2) NOT NULL, -- Nợ gốc ban đầu
  remaining_principal DECIMAL(15, 2) NOT NULL, -- Dư nợ còn lại
  interest_rate DECIMAL(5, 2), -- Lãi suất % năm
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Bảng Tài sản (Assets)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- BĐS, Vàng, Cổ phiếu...
  buy_price DECIMAL(15, 2) NOT NULL, -- Giá Mua
  current_value DECIMAL(15, 2) NOT NULL, -- Giá trị hiện tại (Cập nhật tay)
  status asset_status DEFAULT 'ACTIVE',
  sell_price DECIMAL(15, 2), -- Giá Bán (nếu đã bán)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Bảng Giao dịch (Transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15, 2) NOT NULL, -- Số tiền
  type transaction_type NOT NULL, -- Thu/Chi/Trả nợ/Bán tài sản
  owner owner_type NOT NULL DEFAULT 'JOINT', -- Ai thực hiện (Hiếu/Ly/Chung)
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày phát sinh
  note TEXT,
  
  -- Khoá ngoại
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  linked_debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  linked_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  -- Phân tách khi trả nợ: số tiền này là trả gốc hay lãi (nếu type = DEBT_PAYMENT)
  is_principal_payment BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. RLS Policies (Hiệu lực bảo mật)
-- Ví dụ: cho phép mọi người dùng ẩn danh đọc/ghi nếu chưa setup Auth, hoặc cấu hình Supabase Auth sau.
-- Tạm thời bỏ qua RLS error bằng cách mở public (Vì gia đình 1 tài khoản nội bộ)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL for authenticatd users on categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticatd users on debts" ON debts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticatd users on assets" ON assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticatd users on transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');

-- 7. Dummy Data cơ bản cho category
INSERT INTO categories (name, type, icon) VALUES 
('Lương', 'INCOME', 'wallet'),
('Bán hàng', 'INCOME', 'store'),
('Cổ tức', 'INCOME', 'pie-chart'),
('Ăn uống', 'EXPENSE', 'utensils'),
('Di chuyển', 'EXPENSE', 'car'),
('Hoá đơn/Tiện ích', 'EXPENSE', 'zap'),
('Sức khoẻ', 'EXPENSE', 'heart-pulse'),
('Giải trí', 'EXPENSE', 'gamepad');
