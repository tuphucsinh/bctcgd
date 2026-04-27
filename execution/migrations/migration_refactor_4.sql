-- [Pending Refactor #4] Security & Policies
-- 1. Hàm ghi nhận giao dịch bằng SECURITY DEFINER (bypass RLS an toàn mà không cần lọt lộ Service Key ở Client/Server)
CREATE OR REPLACE FUNCTION log_transaction(
  p_amount numeric,
  p_type text,
  p_category_id text DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_owner text DEFAULT NULL,
  p_date text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO transactions (amount, type, category_id, note, owner, date)
  VALUES (
    p_amount, 
    p_type::transaction_type, 
    p_category_id::uuid, 
    p_note, 
    p_owner::owner_type, 
    COALESCE(p_date::date, CURRENT_DATE)
  );
END;
$$;

-- 2. Hàm Import toàn bộ Database bằng SECURITY DEFINER 
CREATE OR REPLACE FUNCTION import_database(
  p_categories jsonb,
  p_assets jsonb,
  p_debts jsonb,
  p_transactions jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncate tables correctly 
  DELETE FROM transactions WHERE id != '00000000-0000-0000-0000-000000000000';
  DELETE FROM assets WHERE id != '00000000-0000-0000-0000-000000000000';
  DELETE FROM debts WHERE id != '00000000-0000-0000-0000-000000000000';
  DELETE FROM categories WHERE id != '00000000-0000-0000-0000-000000000000';

  -- Insert data
  IF p_categories IS NOT NULL AND jsonb_array_length(p_categories) > 0 THEN
    INSERT INTO categories SELECT * FROM jsonb_populate_recordset(null::categories, p_categories);
  END IF;
  
  IF p_assets IS NOT NULL AND jsonb_array_length(p_assets) > 0 THEN
    INSERT INTO assets SELECT * FROM jsonb_populate_recordset(null::assets, p_assets);
  END IF;

  IF p_debts IS NOT NULL AND jsonb_array_length(p_debts) > 0 THEN
    INSERT INTO debts SELECT * FROM jsonb_populate_recordset(null::debts, p_debts);
  END IF;

  IF p_transactions IS NOT NULL AND jsonb_array_length(p_transactions) > 0 THEN
    INSERT INTO transactions SELECT * FROM jsonb_populate_recordset(null::transactions, p_transactions);
  END IF;
END;
$$;
