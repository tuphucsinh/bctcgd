"use server";

import { createClient } from '@/utils/supabase/server';
import { handleActionError, ActionResult } from './helpers';

export type DebtInput = {
  name: string;
  debtor_creditor: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  original_principal: number;
  remaining_principal: number;
  start_date: string;
  owner?: 'HIEU' | 'LY';
};

export async function getDebts() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[DATABASE_ERROR] getDebts:', error);
    return []; // Return mảng rỗng để không break UI
  }
}

export async function createDebt(input: DebtInput): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('debts')
      .insert([{
        name: input.name,
        debtor_creditor: input.debtor_creditor,
        debt_type: input.type === 'PAYABLE' ? 'BORROW' : 'LEND',
        amount: input.original_principal,
        remaining_amount: input.remaining_principal,
        due_date: input.start_date, // Tạm dùng start_date vào due_date
        owner: input.owner || 'HIEU'
      }])
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return handleActionError('createDebt', error);
  }
}
