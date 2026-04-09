"use server";

import { createClient } from '@/utils/supabase/server';
import { ActionResult, handleActionError } from './helpers';
import { revalidatePath } from 'next/cache';

export interface AppSettings {
  target_income: number;
  target_spending: number;
  user_id: string;
}

export async function getSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('target_income, target_spending, user_id')
    .eq('user_id', 'family')
    .single();

  if (error || !data) {
    return { target_income: 0, target_spending: 0, user_id: 'family' };
  }
  return data;
}

export async function updateSettings(data: Partial<AppSettings>): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('app_settings')
      .update({
        target_income: data.target_income,
        target_spending: data.target_spending,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', 'family');

    if (error) throw error;
    revalidatePath('/');
    return { success: true, data: null };
  } catch (error) {
    return handleActionError('updateSettings', error);
  }
}

export async function exportDatabase(): Promise<string> {
  const supabase = await createClient();
  
  const [assets, debts, transactions, categories] = await Promise.all([
    supabase.from('assets').select('*'),
    supabase.from('debts').select('*'),
    supabase.from('transactions').select('*'),
    supabase.from('categories').select('*')
  ]);

  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      assets: assets.data || [],
      debts: debts.data || [],
      transactions: transactions.data || [],
      categories: categories.data || []
    }
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importDatabase(jsonData: string): Promise<ActionResult> {
  try {
    const backup = JSON.parse(jsonData);
    const { assets, debts, transactions, categories } = backup.data;

    const supabase = await createClient();
    const { error: importError } = await supabase.rpc('import_database', {
      p_categories: categories || [],
      p_assets: assets || [],
      p_debts: debts || [],
      p_transactions: transactions || []
    });

    if (importError) throw importError;

    revalidatePath('/');
    return { success: true, data: null };
  } catch (error) {
    return handleActionError('importDatabase', error);
  }
}
