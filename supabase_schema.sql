-- 1. Enum cho các trường phân loại
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_BUY', 'ASSET_SELL', 'ADJUSTMENT');
CREATE TYPE owner_type AS ENUM ('HIEU', 'LY');
CREATE TYPE asset_status AS ENUM ('ACTIVE', 'SOLD');
CREATE TYPE category_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE asset_cat_type AS ENUM ('REAL_ESTATE', 'FINANCE', 'GOLD', 'OTHER');
CREATE TYPE debt_type AS ENUM ('BORROW', 'LEND');
CREATE TYPE debt_term AS ENUM ('SHORT', 'LONG');

-- 2. Bảng Danh mục (Categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type category_type NOT NULL,
  is_passive BOOLEAN DEFAULT false, -- True: Thụ động (với thu nhập), False: Chủ động
  icon TEXT, -- Dùng icon name (vd: 'car', 'home')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Bảng Nợ (Debts)
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  debt_type debt_type NOT NULL DEFAULT 'BORROW', -- Phân biệt Nợ (Borrow) / Cho vay (Lend)
  category TEXT, -- 'Ngân hàng', 'Cọc BĐS', 'Nợ khác'
  term debt_term, -- 'SHORT' hoặc 'LONG'
  initial_principal DECIMAL(15, 2) NOT NULL, -- Số tiền gốc (vay/cho vay)
  remaining_principal DECIMAL(15, 2) NOT NULL, -- Dư nợ/dư cho vay còn lại
  interest_rate DECIMAL(5, 2), -- Lãi suất % năm
  monthly_payment_amount DECIMAL(15, 2), -- Số tiền gốc trả/tháng (với NH)
  due_date DATE, -- Ngày trả (với Cho vay/Đáo hạn nợ)
  note TEXT,
  owner owner_type NOT NULL DEFAULT 'HIEU', -- Ai là chủ khoản nợ này
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Bảng Tài sản (Assets)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type asset_cat_type NOT NULL, -- BĐS, Vàng, Tài chính...
  buy_price DECIMAL(15, 2) NOT NULL, -- Giá Mua
  quantity DECIMAL(15, 4) DEFAULT 1, -- Số lượng mặc định là 1 nếu là tài sản đơn lẻ
  current_price DECIMAL(15, 2), -- Đơn giá hiện tại
  current_value DECIMAL(15, 2) NOT NULL, -- Giá trị hiện tại (Cập nhật tay)
  status asset_status DEFAULT 'ACTIVE',
  sell_price DECIMAL(15, 2), -- Giá Bán (nếu đã bán)
  note TEXT,
  owner owner_type NOT NULL DEFAULT 'HIEU', -- Ai là chủ tài sản này
  asset_class TEXT, -- LIQUID (Thanh khoản), GROWTH (Tăng trưởng), FIXED (Cố định)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Bảng Giao dịch (Transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15, 2) NOT NULL, -- Số tiền
  type transaction_type NOT NULL, -- Thu/Chi/Trả nợ/Bán tài sản/Điều chỉnh
  owner owner_type NOT NULL, -- Ai thực hiện (Hiếu/Ly)
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

-- 6. Bảng Cấu hình / Cài đặt Hệ thống (App Settings)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) UNIQUE DEFAULT 'family', 
  target_income DECIMAL(15, 2) DEFAULT 0,
  target_spending DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. RLS Policies (Hiệu lực bảo mật)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL for authenticated users on categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticated users on debts" ON debts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticated users on assets" ON assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticated users on transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow ALL for authenticated users on app_settings" ON app_settings FOR ALL USING (auth.role() = 'authenticated');

-- 8. Dummy Data cơ bản
INSERT INTO app_settings (user_id, target_income, target_spending) VALUES ('family', 100000000, 50000000) ON CONFLICT (user_id) DO NOTHING;
