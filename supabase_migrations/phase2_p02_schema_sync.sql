-- ============================================================
-- BCTCGD Phase 2 — P0-2: Schema Column Rename Migration
-- Chạy CẨN THẬN trong Supabase Dashboard > SQL Editor
-- KIỂM TRA column names hiện tại TRƯỚC KHI chạy
-- ============================================================

-- Kiểm tra trước:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'assets';

-- [1] assets: Nếu column hiện tại là 'buy_price', đổi sang 'purchase_price'
-- Chạy dòng này CHỈ KHI cột 'buy_price' tồn tại:
-- ALTER TABLE assets RENAME COLUMN buy_price TO purchase_price;

-- [2] assets: Nếu column là 'note', đổi sang 'notes'
-- ALTER TABLE assets RENAME COLUMN note TO notes;

-- [3] debts: Nếu column là 'note', đổi sang 'notes'
-- ALTER TABLE debts RENAME COLUMN note TO notes;

-- [4] Thêm cột mới nếu chưa có
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_system_cash_account BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_class TEXT;

-- [5] Thêm cột linked_debt_id, linked_asset_id cho transactions nếu chưa có
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS linked_debt_id UUID REFERENCES debts(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS linked_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_principal_payment BOOLEAN DEFAULT false;

-- [6] Kiểm tra kết quả
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('assets', 'debts', 'transactions')
ORDER BY table_name, ordinal_position;
