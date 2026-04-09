-- PHƯƠNG ÁN 1: SERVER-SIDE AGGREGATION BẰNG POSTGRES RPC
-- Chạy đoạn mã này trong Supabase > SQL Editor

-- 1. Hàm tính tổng các chỉ số Thu, Chi, Thu nhập thụ động theo tháng
CREATE OR REPLACE FUNCTION get_transaction_summary(p_owners text[], p_start_date date)
RETURNS TABLE (monthly_income numeric, monthly_spending numeric, passive_income numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_income numeric := 0;
  v_spending numeric := 0;
  v_passive numeric := 0;
BEGIN
  -- Tính tổng thu nhập
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE type = 'INCOME' AND owner = ANY(p_owners) AND date >= p_start_date;

  -- Tính tổng chi tiêu
  SELECT COALESCE(SUM(amount), 0) INTO v_spending
  FROM transactions
  WHERE type = 'EXPENSE' AND owner = ANY(p_owners) AND date >= p_start_date;

  -- Tính tổng thu nhập thụ động
  SELECT COALESCE(SUM(t.amount), 0) INTO v_passive
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.type = 'INCOME' AND t.owner = ANY(p_owners) AND t.date >= p_start_date AND c.is_passive = true;

  RETURN QUERY SELECT v_income, v_spending, v_passive;
END;
$$;


-- 2. Hàm gom nhóm và tính xu hướng thu/chi theo từng ngày
CREATE OR REPLACE FUNCTION get_daily_trend(p_owners text[], p_start_date date)
RETURNS TABLE (trend_date date, income numeric, expense numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    date as trend_date,
    COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as expense
  FROM transactions
  WHERE owner = ANY(p_owners) AND date >= p_start_date
  GROUP BY date
  ORDER BY date ASC;
$$;
