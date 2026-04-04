"use server";

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { handleActionError, ActionResult, getOwnerFilter } from './helpers';

const TransactionSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  category_id: z.string().uuid().optional().nullable(),
  note: z.string().max(500, "Ghi chú quá dài"),
  user_id: z.enum(['hieu', 'ly']),
  type: z.enum(['INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_SELL']),
});

export type TransactionInput = {
  amount: number;
  category_id?: string;
  note: string;
  user_id: string; // 'hieu' | 'ly'
  type: 'INCOME' | 'EXPENSE' | 'DEBT_PAYMENT' | 'ASSET_SELL';
};

export async function addTransaction(input: TransactionInput): Promise<ActionResult> {
  try {
    const validated = TransactionSchema.safeParse(input);
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }

    const owner = getOwnerFilter(input.user_id, false);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        amount: input.amount,
        category_id: input.category_id || null,
        note: input.note,
        owner: owner,
        type: input.type,
        date: new Date().toISOString().split('T')[0]
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return handleActionError('addTransaction', error);
  }
}

export async function getRecentTransactions(userId: string, limit = 5) {
  try {
    const owners = getOwnerFilter(userId, true) as string[];
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name, icon)')
      .in('owner', owners)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SERVER_ERROR] getRecentTransactions:', error);
    return [];
  }
}

// Giả sử category thay đổi không nhiều, nhưng hiện tại vẫn gọi thẳng DB.
export async function getCategories() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SERVER_ERROR] getCategories:', error);
    return [];
  }
}

export async function getIncomeTransactions(userId: string) {
  try {
    const owners = getOwnerFilter(userId, true) as string[];
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name, icon, is_passive)')
      .eq('type', 'INCOME')
      .in('owner', owners)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SERVER_ERROR] getIncomeTransactions:', error);
    return [];
  }
}

export async function getExpenseTransactions(userId: string) {
  try {
    const owners = getOwnerFilter(userId, true) as string[];
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name, icon)')
      .eq('type', 'EXPENSE')
      .in('owner', owners)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SERVER_ERROR] getExpenseTransactions:', error);
    return [];
  }
}
