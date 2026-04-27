-- ============================================================
-- BCTCGD — Database Schema (Synchronized with codebase)
-- Last updated: 2026-04-27 (Phase 2 Refactor)
-- ============================================================

-- 1. Enum cho các trường phân loại
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_BUY', 'ASSET_SELL', 'ADJUSTMENT');
CREATE TYPE owner_type AS ENUM ('HIEU', 'LY');
CREATE TYPE asset_status AS ENUM ('ACTIVE', 'SOLD');
CREATE TYPE category_type AS ENUM ('INCOME', 'EXPENSE');
-- asset_cat_type mở rộng để khớp với AssetInput type trong code
CREATE TYPE asset_cat_type AS ENUM ('REAL_ESTATE', 'FINANCE', 'CRYPTO', 'GOLD', 'OTHER');
CREATE TYPE debt_type AS ENUM ('BORROW', 'LEND');
CREATE TYPE debt_term AS ENUM ('SHORT', 'LONG');

-- 2. Bảng Danh mục (Categories)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type category_type NOT NULL,
  is_passive BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Bảng Nợ (Debts)
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  debt_type debt_type NOT NULL DEFAULT 'BORROW',
  category TEXT,
  term debt_term,
  initial_principal DECIMAL(15, 2) NOT NULL,
  remaining_principal DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2),
  monthly_payment_amount DECIMAL(15, 2),
  due_date DATE,
  notes TEXT,              -- [SYNC] Đổi từ 'note' -> 'notes' để khớp với code
  owner owner_type NOT NULL DEFAULT 'HIEU',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Bảng Tài sản (Assets)
-- NOTE: Bảng này bao gồm cả tài khoản tiền mặt hệ thống (is_system_cash_account = true)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type asset_cat_type NOT NULL,
  purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0, -- [SYNC] Đổi từ 'buy_price' -> 'purchase_price'
  quantity DECIMAL(15, 4) DEFAULT 1,
  current_price DECIMAL(15, 2),
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status asset_status DEFAULT 'ACTIVE',
  sell_price DECIMAL(15, 2),
  notes TEXT,              -- [SYNC] Đổi từ 'note' -> 'notes' để khớp với code
  asset_class TEXT,        -- 'LIQUID' | 'FIXED'
  is_system_cash_account BOOLEAN DEFAULT false, -- [NEW] Flag cho tài khoản tiền mặt hệ thống
  bank_name TEXT,          -- [NEW] Tên ngân hàng (nếu có)
  icon TEXT,               -- [NEW]
  color TEXT,              -- [NEW]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Bảng Giao dịch (Transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  owner owner_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,              -- [SYNC] Đổi từ 'note' -> 'notes' để khớp

  -- Khoá ngoại
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  linked_debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
  linked_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  -- Phân tách khi trả nợ
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

-- 7. RLS Policies
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

-- 8. Atomic RPC Functions (Phase 2 — apply riêng qua supabase_migrations/phase2_p01_atomic_rpcs.sql)

-- 9. Default data
INSERT INTO app_settings (user_id, target_income, target_spending) 
VALUES ('family', 100000000, 50000000) 
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- CHANGELOG
-- 2026-04-27: [P0-2] Sync schema với codebase:
--   - assets.buy_price -> assets.purchase_price
--   - assets.note -> assets.notes
--   - debts.note -> debts.notes
--   - transactions.note -> transactions.notes (nếu cần)
--   - Thêm: assets.is_system_cash_account, bank_name, icon, color
--   - Thêm: asset_cat_type.CRYPTO, asset_cat_type.OTHER
-- ============================================================
