import { supabase } from './supabase';

export type TransactionInput = {
  amount: number;
  category_id?: string;
  note: string;
  user_id: string; // 'hieu' | 'ly'
  type: 'INCOME' | 'EXPENSE' | 'DEBT_PAYMENT' | 'ASSET_SELL';
};

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
    .select('current_value')
    .eq('status', 'ACTIVE');
    
  // 2. Tổng dư nợ hiện tại
  const { data: debts } = await supabase
    .from('debts')
    .select('remaining_principal');

  // 3. Giao dịch trong tháng này
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('owner', owner)
    .gte('created_at', startOfMonth.toISOString());

  const totalAssets = assets?.reduce((sum: number, a) => sum + Number(a.current_value), 0) || 0;
  const totalDebts = debts?.reduce((sum: number, d) => sum + Number(d.remaining_principal), 0) || 0;
  
  const monthlyIncome = transactions
    ?.filter(t => t.type === 'INCOME')
    .reduce((sum: number, t) => sum + Number(t.amount), 0) || 0;
    
  const monthlySpending = transactions
    ?.filter(t => t.type === 'EXPENSE')
    .reduce((sum: number, t) => sum + Number(t.amount), 0) || 0;

  return {
    totalAssets,
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
    .order('created_at', { ascending: false })
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
  type: 'CASH' | 'BANK' | 'SAVINGS' | 'INVESTMENT';
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
