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

    const [assetsResult, debtsResult, transactionsResult, settingsResult] = await Promise.all([
      supabase.from('assets').select('current_value, type, name').eq('status', 'ACTIVE'),
      supabase.from('debts').select('remaining_principal'),
      supabase.from('transactions').select('amount, type, categories(is_passive)').gte('date', startOfMonth.toISOString().split('T')[0]).in('owner', getOwnerFilter(userId, true) as string[]),
      supabase.from('app_settings').select('target_income, target_spending').eq('user_id', 'family').single()
    ]);

    if (assetsResult.error || debtsResult.error || transactionsResult.error) {
      const err = assetsResult.error || debtsResult.error || transactionsResult.error;
      console.error('[DATABASE_ERROR] getFinancialSummary:', err);
      return {
        totalAssets: 0, totalCash: 0, totalDebts: 0, netWorth: 0,
        monthlyIncome: 0, monthlySpending: 0, cashFlow: 0,
        passiveIncome: 0, passiveRate: 0, hasError: true,
        targetIncome: 0, targetSpending: 0
      };
    }

    const { data: assets } = assetsResult;
    const { data: debts } = debtsResult;
    const { data: transactions } = transactionsResult;
    const { data: settings } = settingsResult;

    const totalAssets = assets?.reduce((sum: number, a: PartialAsset) => sum + Number(a.current_value), 0) || 0;
    const totalCash = assets?.filter((a: PartialAsset) => a.name === 'Tiền mặt').reduce((sum: number, a: PartialAsset) => sum + Number(a.current_value), 0) || 0;
    const totalDebts = debts?.reduce((sum: number, d: PartialDebt) => sum + Number(d.remaining_principal), 0) || 0;
    
    let monthlyIncome = 0;
    let monthlySpending = 0;
    let passiveIncome = 0;

    transactions?.forEach((t: { amount: number | string; type: string; categories?: { is_passive?: boolean } | { is_passive?: boolean }[] | null }) => {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') {
        monthlyIncome += amount;
        const isPassive = Array.isArray(t.categories) ? t.categories[0]?.is_passive : t.categories?.is_passive;
        if (isPassive) {
          passiveIncome += amount;
        }
      }
      else if (t.type === 'EXPENSE') monthlySpending += amount;
    });

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
  
    let query = supabase
      .from('transactions')
      .select('amount, type, date')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true });
  
    query = query.in('owner', getOwnerFilter(userId, true) as string[]);
  
    const { data: transactions, error } = await query;
  
    if (error) throw error;
  
    const dailyData: Record<string, { date: string, income: number, expense: number }> = {};
    
    transactions?.forEach(t => {
      const d = new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (!dailyData[d]) {
        dailyData[d] = { date: d, income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') dailyData[d].income += Number(t.amount);
      if (t.type === 'EXPENSE') dailyData[d].expense += Number(t.amount);
    });
  
    return Object.values(dailyData);
  } catch (error) {
    console.error('[SERVER_ERROR] getMonthlyTrend:', error);
    return [];
  }
}
