"use server";

import { createClient } from '@/utils/supabase/server';
import { getOwnerFilter } from './helpers';

// Helper local types (không xuất ra ngoài)
interface PartialAsset {
  current_value: number;
  type: string;
  name?: string;
}

interface PartialDebt {
  remaining_principal: number;
}


export async function getFinancialSummary(userId: string) {
  const supabase = await createClient();
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const owners = getOwnerFilter(userId, true) as string[];

    const [assetsResult, debtsResult, settingsResult, rpcResult] = await Promise.all([
      supabase.from('assets').select('current_value, type, name, is_system_cash_account').eq('status', 'ACTIVE'),
      supabase.from('debts').select('remaining_principal'),
      supabase.from('app_settings').select('target_income, target_spending').eq('user_id', 'family').single(),
      supabase.rpc('get_transaction_summary', { 
        p_owners: owners, 
        p_start_date: startDateStr 
      })
    ]);

    if (assetsResult.error || debtsResult.error || rpcResult.error) {
      console.error('[DATABASE_ERROR] getFinancialSummary:', rpcResult.error || assetsResult.error || debtsResult.error);
      return {
        totalAssets: 0, totalCash: 0, totalDebts: 0, netWorth: 0,
        monthlyIncome: 0, monthlySpending: 0, cashFlow: 0,
        passiveIncome: 0, passiveRate: 0, hasError: true,
        targetIncome: 0, targetSpending: 0
      };
    }

    const { data: assets } = assetsResult;
    const { data: debts } = debtsResult;
    const { data: settings } = settingsResult;
    const stats: any = rpcResult.data && rpcResult.data.length > 0 ? rpcResult.data[0] : null;

    const totalAssets = assets?.reduce((sum: number, a: any) => sum + Number(a.current_value), 0) || 0;
    const totalCash = assets?.filter((a: any) => a.is_system_cash_account === true).reduce((sum: number, a: any) => sum + Number(a.current_value), 0) || 0;
    const totalDebts = debts?.reduce((sum: number, d: PartialDebt) => sum + Number(d.remaining_principal || 0), 0) || 0;
    
    const monthlyIncome = Number(stats?.monthly_income || 0);
    const monthlySpending = Number(stats?.monthly_spending || 0);
    const passiveIncome = Number(stats?.passive_income || 0);

    return {
      totalAssets,
      totalCash,
      totalDebts,
      netWorth: totalAssets - totalDebts,
      monthlyIncome,
      monthlySpending,
      cashFlow: monthlyIncome - monthlySpending,
      passiveIncome,
      targetIncome: settings?.target_income || 0,
      targetSpending: settings?.target_spending || 0,
      hasError: false
    };
  } catch (error) {
    console.error('[SERVER_ERROR] getFinancialSummary:', error);
    return {
      totalAssets: 0, totalCash: 0, totalDebts: 0, netWorth: 0,
      monthlyIncome: 0, monthlySpending: 0, cashFlow: 0,
      passiveIncome: 0, passiveRate: 0, hasError: true,
      targetIncome: 0, targetSpending: 0
    };
  }
}

export async function getMonthlyTrend(userId: string) {
  const supabase = await createClient();
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const owners = getOwnerFilter(userId, true) as string[];
  
    const { data, error } = await supabase.rpc('get_daily_trend', {
      p_owners: owners,
      p_start_date: startDateStr
    });
  
    if (error) throw error;
  
    // data format: [{trend_date: '2026-04-01', income: 100, expense: 50}, ...]
    // Cần format lại theo ngày/tháng để hiển thị
    const formattedData = (data || []).map((row: any) => ({
      date: new Date(row.trend_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      income: Number(row.income || 0),
      expense: Number(row.expense || 0)
    }));
  
    return formattedData;
  } catch (error) {
    console.error('[SERVER_ERROR] getMonthlyTrend:', error);
    return [];
  }
}
