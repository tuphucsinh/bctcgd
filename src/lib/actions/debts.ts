"use server";

import { createClient } from '@/utils/supabase/server';
import { handleActionError, ActionResult, getOwnerFilter } from './helpers';
import { adjustCashAmount } from './assets';

export type DebtInput = {
  name: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  original_principal: number;
  remaining_principal: number;
  term: 'SHORT_TERM' | 'LONG_TERM';
  interest_rate?: number;
  monthly_payment_amount?: number;
  update_cash?: boolean;
  userId?: string;
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
    const originalPrincipal = Number(input.original_principal);
    const remainingPrincipal = Number(input.remaining_principal);

    if (isNaN(originalPrincipal) || isNaN(remainingPrincipal)) {
      throw new Error("Dữ liệu số tiền không hợp lệ");
    }

    const { data, error } = await supabase
      .from('debts')
      .insert([{
        name: input.name,
        debt_type: input.type === 'PAYABLE' ? 'BORROW' : 'LEND',
        initial_principal: originalPrincipal,
        remaining_principal: remainingPrincipal,
        interest_rate: input.interest_rate || null,
        term: input.term === 'SHORT_TERM' ? 'SHORT' : 'LONG',
        monthly_payment_amount: input.monthly_payment_amount || null
      }])
      .select();
      
    if (error) throw error;

    if (input.update_cash) {
      const isPayable = input.type === 'PAYABLE';
      const changeAmount = isPayable ? input.original_principal : -input.original_principal;
      await adjustCashAmount(changeAmount);

      const debtId = data && data[0] ? data[0].id : null;
      if (debtId) {
        await supabase.from('transactions').insert([{
          amount: input.original_principal,
          type: 'ADJUSTMENT',
          note: isPayable ? `Nhận tiền vay: ${input.name}` : `Giải ngân cho vay: ${input.name}`,
          owner: getOwnerFilter(input.userId || 'gd', false),
          linked_debt_id: debtId,
          is_principal_payment: true,
          date: new Date().toISOString().split('T')[0]
        }]);
      }
    }

    return { success: true, data };
  } catch (error) {
    return handleActionError('createDebt', error);
  }
}

export async function recordDebtTransaction(input: {
  debtId: string;
  amount: number;
  isPrincipal: boolean;
  note?: string;
  userId?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const owner = getOwnerFilter(input.userId || 'gd', false);

  try {
    // 1. Lấy thông tin khoản nợ
    const { data: debt, error: debtError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', input.debtId)
      .single();

    if (debtError || !debt) throw new Error("Không tìm thấy khoản nợ");

    // 2. Tạo giao dịch
    const { error: transError } = await supabase
      .from('transactions')
      .insert([{
        amount: input.amount,
        note: input.note || (input.isPrincipal ? `Trả gốc/Hồi vốn: ${debt.name}` : `Trả lãi: ${debt.name}`),
        type: 'DEBT_PAYMENT',
        linked_debt_id: input.debtId,
        is_principal_payment: input.isPrincipal,
        owner,
        date: new Date().toISOString().split('T')[0]
      }]);

    if (transError) throw transError;

    // 3. Cập nhật số dư nợ nếu là trả gốc
    if (input.isPrincipal) {
      const newRemaining = Number(debt.remaining_principal) - input.amount;
      const { error: updateError } = await supabase
        .from('debts')
        .update({ remaining_principal: Math.max(0, newRemaining) })
        .eq('id', input.debtId);

      if (updateError) throw updateError;
    }

    // 4. Update cash based on debt type
    if (debt.debt_type === 'BORROW') {
      // Paying debt/interest -> deducts cash
      await adjustCashAmount(-input.amount);
    } else if (debt.debt_type === 'LEND') {
      // Receiving debt/interest -> increases cash
      await adjustCashAmount(input.amount);
    }

    return { success: true, data: null };
  } catch (error) {
    return handleActionError('recordDebtTransaction', error);
  }
}

export async function updateDebt(id: string, input: DebtInput): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('debts')
      .update({
        name: input.name,
        debt_type: input.type === 'PAYABLE' ? 'BORROW' : 'LEND',
        initial_principal: input.original_principal,
        remaining_principal: input.remaining_principal,
        interest_rate: input.interest_rate || null,
        term: input.term === 'SHORT_TERM' ? 'SHORT' : 'LONG',
        monthly_payment_amount: input.monthly_payment_amount || null
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return handleActionError('updateDebt', error);
  }
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return handleActionError('deleteDebt', error);
  }
}
