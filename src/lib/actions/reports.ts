"use server";

import { createClient } from '@/utils/supabase/server';

/**
 * Lấy dữ liệu dòng tiền theo tháng (6 tháng gần nhất)
 */
export async function getMonthlyCashflow(monthsLimit: number = 6) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('get_monthly_cashflow', {
      p_months_limit: monthsLimit
    });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      month: new Date(row.month_date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
      income: Number(row.total_income || 0),
      expense: Number(row.total_expense || 0),
      rawDate: row.month_date
    }));
  } catch (error) {
    console.error('[SERVER_ERROR] getMonthlyCashflow:', error);
    return [];
  }
}

/**
 * Lấy dữ liệu chi tiêu theo danh mục trong một khoảng thời gian
 */
export async function getExpensesByCategory(startDate: string, endDate: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.rpc('get_expenses_by_category', {
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      name: row.category_name,
      value: Number(row.total_amount || 0),
      count: Number(row.transaction_count || 0)
    }));
  } catch (error) {
    console.error('[SERVER_ERROR] getExpensesByCategory:', error);
    return [];
  }
}

/**
 * Lấy thống kê tổng quan cho báo cáo
 */
export async function getReportSummary() {
  const supabase = await createClient();
  try {
    const { data: assets } = await supabase.from('assets').select('current_value, type').eq('status', 'ACTIVE');
    const { data: debts } = await supabase.from('debts').select('remaining_principal');
    
    const totalAssets = assets?.reduce((sum, a) => sum + Number(a.current_value), 0) || 0;
    const totalDebts = debts?.reduce((sum, d) => sum + Number(d.remaining_principal), 0) || 0;
    
    // Phân bổ tài sản theo loại
    const assetDistribution = assets?.reduce((acc: any, a) => {
      acc[a.type] = (acc[a.type] || 0) + Number(a.current_value);
      return acc;
    }, {});

    const distributionData = Object.keys(assetDistribution || {}).map(key => ({
      name: key,
      value: assetDistribution[key]
    }));

    return {
      totalAssets,
      totalDebts,
      netWorth: totalAssets - totalDebts,
      assetDistribution: distributionData
    };
  } catch (error) {
    console.error('[SERVER_ERROR] getReportSummary:', error);
    return null;
  }
}
