-- get_monthly_cashflow: Monthly total income vs expenses for the last 6 months
CREATE OR REPLACE FUNCTION get_monthly_cashflow(p_months_limit int DEFAULT 6)
RETURNS TABLE (
  month_date DATE,
  total_income DECIMAL(15, 2),
  total_expense DECIMAL(15, 2)
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE months AS (
    SELECT date_trunc('month', CURRENT_DATE)::DATE as m
    UNION ALL
    SELECT (m - interval '1 month')::DATE
    FROM months
    WHERE m > (date_trunc('month', CURRENT_DATE) - ((p_months_limit - 1) || ' months')::interval)::DATE
  ),
  monthly_data AS (
    SELECT 
      date_trunc('month', date)::DATE as t_month,
      SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE date >= (date_trunc('month', CURRENT_DATE) - ((p_months_limit - 1) || ' months')::interval)::DATE
    GROUP BY 1
  )
  SELECT 
    m.m as month_date,
    COALESCE(md.income, 0) as total_income,
    COALESCE(md.expense, 0) as total_expense
  FROM months m
  LEFT JOIN monthly_data md ON m.m = md.t_month
  ORDER BY m.m ASC;
END;
$$;

-- get_expenses_by_category: Expense breakdown by category for a specific range
CREATE OR REPLACE FUNCTION get_expenses_by_category(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  category_name TEXT,
  total_amount DECIMAL(15, 2),
  transaction_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.name, 'Chưa phân loại') as category_name,
    SUM(t.amount) as total_amount,
    COUNT(t.id) as transaction_count
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.type = 'EXPENSE'
    AND t.date >= p_start_date
    AND t.date <= p_end_date
  GROUP BY 1
  ORDER BY 2 DESC;
END;
$$;
