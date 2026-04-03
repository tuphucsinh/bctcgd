"use server";

import { supabase } from './supabase';

export type TransactionInput = {
  amount: number;
  category_id?: string;
  note: string;
  user_id: string; // 'hieu' | 'ly'
  type: 'INCOME' | 'EXPENSE' | 'DEBT_PAYMENT' | 'ASSET_SELL';
};

interface Asset {
  current_value: number;
  type: string;
}

interface Debt {
  remaining_principal: number;
}

interface Transaction {
  amount: number;
  type: string;
}

/**
 * Lấy tóm tắt tài chính dựa theo User
 */
export async function getFinancialSummary(userId: string) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };
  const owner = ownerMap[userId] || 'JOINT';

  // 1. Tổng giá trị tài sản hiện tại
  const { data: assets } = await supabase
    .from('assets')
    .select('current_value, type')
    .eq('status', 'ACTIVE');
    
  // 2. Tổng dư nợ hiện tại
  const { data: debts } = await supabase
    .from('debts')
    .select('remaining_principal');

  // 3. Giao dịch
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('owner', owner);

  const totalAssets = assets?.reduce((sum: number, a: Asset) => sum + Number(a.current_value), 0) || 0;
  const totalCash = assets?.filter((a: Asset) => a.type === 'CASH').reduce((sum: number, a: Asset) => sum + Number(a.current_value), 0) || 0;
  const totalDebts = debts?.reduce((sum: number, d: Debt) => sum + Number(d.remaining_principal), 0) || 0;
  
  const monthlyIncome = transactions
    ?.filter((t: Transaction) => t.type === 'INCOME')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) || 0;
    
  const monthlySpending = transactions
    ?.filter((t: Transaction) => t.type === 'EXPENSE')
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) || 0;

  return {
    totalAssets,
    totalCash,
    totalDebts,
    netWorth: totalAssets - totalDebts,
    monthlyIncome,
    monthlySpending,
    cashFlow: monthlyIncome - monthlySpending,
  };
}

/**
 * Thêm giao dịch mới
 */
export async function addTransaction(input: TransactionInput) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      amount: input.amount,
      category_id: input.category_id || null,
      note: input.note,
      owner: ownerMap[input.user_id] || 'JOINT',
      type: input.type,
      date: new Date().toISOString().split('T')[0]
    }])
    .select();

  if (error) throw error;
  return data;
}

/**
 * Lấy danh sách giao dịch gần đây
 */
export async function getRecentTransactions(userId: string, limit = 5) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('owner', ownerMap[userId] || 'JOINT')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Lấy danh mục
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

// === API FOR ASSETS ===
export async function getAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export type AssetInput = {
  name: string;
  type: 'CASH' | 'BANK' | 'SAVINGS' | 'INVESTMENT' | 'FINANCE' | 'REAL_ESTATE' | 'CRYPTO' | 'GOLD' | 'OTHER';
  current_value: number;
  owner?: 'HIEU' | 'LY' | 'JOINT';
  icon?: string;
  color?: string;
  bank_name?: string;
};

export async function createAsset(input: AssetInput) {
  const { data, error } = await supabase
    .from('assets')
    .insert([{
      ...input,
      owner: input.owner || 'JOINT',
      status: 'ACTIVE'
    }])
    .select();
  if (error) throw error;
  return data;
}

// === API FOR DEBTS ===
export async function getDebts() {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export type DebtInput = {
  name: string;
  debtor_creditor: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  original_principal: number;
  remaining_principal: number;
  start_date: string;
  owner?: 'HIEU' | 'LY' | 'JOINT';
};

export async function createDebt(input: DebtInput) {
  const { data, error } = await supabase
    .from('debts')
    .insert([{
      ...input,
      owner: input.owner || 'JOINT',
      status: 'ACTIVE'
    }])
    .select();
  if (error) throw error;
  return data;
}

/**
 * Láy dữ liệu biểu đồ xu hướng Tháng
 */
export async function getMonthlyTrend(userId: string) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };
  const owner = ownerMap[userId] || 'JOINT';

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('owner', owner)
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  const dailyData: Record<string, { date: string, income: number, expense: number }> = {};
  
  // Tổng hợp dữ liệu theo ngày
  transactions?.forEach(t => {
    const d = new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (!dailyData[d]) {
      dailyData[d] = { date: d, income: 0, expense: 0 };
    }
    if (t.type === 'INCOME') dailyData[d].income += Number(t.amount);
    if (t.type === 'EXPENSE') dailyData[d].expense += Number(t.amount);
  });

  return Object.values(dailyData);
}

/**
 * Lấy danh sách giao dịch THU NHẬP trong tháng hiện tại
 */
export async function getIncomeTransactions(userId: string) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };
  
  
  let query = supabase
    .from('transactions')
    .select('*, categories(name, icon, income_type)')
    .eq('type', 'INCOME')
    .order('date', { ascending: false });

  if (userId !== 'all') {
    const owner = ownerMap[userId] || 'JOINT';
    query = query.eq('owner', owner);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`[ERROR] getIncomeTransactions for ${userId}:`, error);
    throw error;
  }
  
  console.log(`[DEBUG] Found ${data?.length} income records for ${userId}`);
  return data;
}

/**
 * Lấy danh sách giao dịch CHI TIÊU trong tháng hiện tại
 */
export async function getExpenseTransactions(userId: string) {
  const ownerMap: Record<string, 'HIEU' | 'LY' | 'JOINT'> = {
    hieu: 'HIEU',
    ly: 'LY',
    joint: 'JOINT'
  };
  
  console.log(`[DEBUG] getExpenseTransactions for ${userId}`);
  
  let query = supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('type', 'EXPENSE')
    .order('date', { ascending: false });

  if (userId !== 'all') {
    const owner = ownerMap[userId] || 'JOINT';
    query = query.eq('owner', owner);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`[ERROR] getExpenseTransactions for ${userId}:`, error);
    throw error;
  }
  
  console.log(`[DEBUG] Found ${data?.length} expense records for ${userId}`);
  return data;
}
