-- ============================================================
-- BCTCGD Phase 2 — P0-1: Atomic RPC Functions
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- RPC 1: Atomic add transaction + adjust cash
-- Thay thế: addTransaction() -> insert + adjustCashAmount() riêng lẻ
CREATE OR REPLACE FUNCTION rpc_add_transaction(
  p_amount        DECIMAL(15,2),
  p_type          TEXT,
  p_owner         TEXT,
  p_note          TEXT DEFAULT '',
  p_category_id   UUID DEFAULT NULL,
  p_date          DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_cash_id        UUID;
  v_current_cash   DECIMAL(15,2);
  v_new_cash       DECIMAL(15,2);
BEGIN
  -- 1. Insert transaction
  INSERT INTO transactions (amount, type, owner, note, category_id, date)
  VALUES (p_amount, p_type::transaction_type, p_owner::owner_type, p_note, p_category_id, p_date)
  RETURNING id INTO v_transaction_id;

  -- 2. Adjust cash atomically (chỉ INCOME/EXPENSE)
  IF p_type IN ('INCOME', 'EXPENSE') THEN
    SELECT id, current_value INTO v_cash_id, v_current_cash
    FROM assets
    WHERE is_system_cash_account = true
    LIMIT 1;

    IF v_cash_id IS NOT NULL THEN
      IF p_type = 'INCOME' THEN
        v_new_cash := COALESCE(v_current_cash, 0) + p_amount;
      ELSE
        v_new_cash := COALESCE(v_current_cash, 0) - p_amount;
      END IF;

      UPDATE assets
      SET current_value = v_new_cash,
          current_price = v_new_cash,
          purchase_price = v_new_cash
      WHERE id = v_cash_id;
    END IF;
  END IF;

  RETURN json_build_object('id', v_transaction_id, 'success', true);

EXCEPTION WHEN OTHERS THEN
  -- Rollback toàn bộ nếu bất kỳ bước nào fail (PostgreSQL automatic)
  RAISE;
END;
$$;

-- RPC 2: Atomic adjust cash delta (dùng cho debt ops, sell asset)
CREATE OR REPLACE FUNCTION rpc_adjust_cash(
  p_delta DECIMAL(15,2)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cash_id      UUID;
  v_current_cash DECIMAL(15,2);
  v_new_cash     DECIMAL(15,2);
BEGIN
  SELECT id, current_value INTO v_cash_id, v_current_cash
  FROM assets
  WHERE is_system_cash_account = true
  LIMIT 1;

  IF v_cash_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Cash account not found');
  END IF;

  v_new_cash := COALESCE(v_current_cash, 0) + p_delta;

  UPDATE assets
  SET current_value = v_new_cash,
      current_price = v_new_cash,
      purchase_price = v_new_cash
  WHERE id = v_cash_id;

  RETURN json_build_object('success', true, 'new_cash', v_new_cash);

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION rpc_add_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_adjust_cash TO authenticated;
