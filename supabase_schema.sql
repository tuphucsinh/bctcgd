-- 1. Enum cho các trường phân loại
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_BUY', 'ASSET_SELL');
CREATE TYPE owner_type AS ENUM ('HIEU', 'LY', 'JOINT');
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
  amount DECIMAL(15, 2) NOT NULL, -- Số tiền gốc (vay/cho vay)
  remaining_amount DECIMAL(15, 2) NOT NULL, -- Dư nợ/dư cho vay còn lại
  interest_rate DECIMAL(5, 2), -- Lãi suất % năm
  monthly_payment_amount DECIMAL(15, 2), -- Số tiền gốc trả/tháng (với NH)
  due_date DATE, -- Ngày trả (với Cho vay/Đáo hạn nợ)
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Bảng Tài sản (Assets)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type asset_cat_type NOT NULL, -- BĐS, Vàng, Tài chính...
  buy_price DECIMAL(15, 2) NOT NULL, -- Giá Mua
  current_value DECIMAL(15, 2) NOT NULL, -- Giá trị hiện tại (Cập nhật tay)
  status asset_status DEFAULT 'ACTIVE',
  sell_price DECIMAL(15, 2), -- Giá Bán (nếu đã bán)
  note TEXT,
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
INSERT INTO categories (name, type, is_passive, icon) VALUES 
-- Thu nhập chủ động
('Lương', 'INCOME', false, 'wallet'),
('Thưởng', 'INCOME', false, 'award'),
-- Thu nhập thụ động
('Bất động sản', 'INCOME', true, 'building'),
('Tài chính', 'INCOME', true, 'trending-up'),
('Thu nhập khác', 'INCOME', true, 'plus-circle'),
-- Chi tiêu
('Ăn uống', 'EXPENSE', false, 'utensils'),
('Di chuyển', 'EXPENSE', false, 'car'),
('Hoá đơn', 'EXPENSE', false, 'receipt'),
('Giao tế', 'EXPENSE', false, 'users'),
('Giải trí', 'EXPENSE', false, 'gamepad-2'),
('Đồ dùng gia đình', 'EXPENSE', false, 'home'),
('Y tế', 'EXPENSE', false, 'heart-pulse'),
('Học hành', 'EXPENSE', false, 'book-open'),
('Con cái', 'EXPENSE', false, 'baby'),
('Chi tiêu khác', 'EXPENSE', false, 'more-horizontal');
