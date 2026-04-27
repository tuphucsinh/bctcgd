"use server";

import { createClient } from '@/utils/supabase/server';
import { ActionResult, handleActionError } from './helpers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface AppSettings {
  target_income: number;
  target_spending: number;
  user_id: string;
}

// P0-7: Zod schema validate dữ liệu import trước khi đưa vào DB
const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  is_passive: z.boolean().optional(),
  icon: z.string().optional().nullable(),
}).loose();

const AssetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  type: z.string().min(1),
  purchase_price: z.number().min(0),
  current_value: z.number().min(0),
  status: z.enum(['ACTIVE', 'SOLD']).optional(),
}).loose();

const DebtSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  initial_principal: z.number().min(0),
  remaining_principal: z.number().min(0),
}).loose();

const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().min(0),
  type: z.enum(['INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'ASSET_BUY', 'ASSET_SELL', 'ADJUSTMENT']),
  owner: z.enum(['HIEU', 'LY']),
}).loose();

const BackupSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  data: z.object({
    assets: z.array(AssetSchema),
    debts: z.array(DebtSchema),
    transactions: z.array(TransactionSchema),
    categories: z.array(CategorySchema),
  })
});

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
  
  // P3-5: Ghi nhận lỗi từng bảng thay vì silently return []
  const [assets, debts, transactions, categories] = await Promise.all([
    supabase.from('assets').select('*'),
    supabase.from('debts').select('*'),
    supabase.from('transactions').select('*'),
    supabase.from('categories').select('*')
  ]);

  const errors: string[] = [];
  if (assets.error) errors.push(`assets: ${assets.error.message}`);
  if (debts.error) errors.push(`debts: ${debts.error.message}`);
  if (transactions.error) errors.push(`transactions: ${transactions.error.message}`);
  if (categories.error) errors.push(`categories: ${categories.error.message}`);

  if (errors.length > 0) {
    console.error('[EXPORT_ERROR]', errors.join(', '));
  }

  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    exportErrors: errors.length > 0 ? errors : undefined,
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
    // P0-7: Parse an toàn
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonData);
    } catch {
      throw new Error('File JSON không hợp lệ — không thể parse');
    }

    // P0-7: Validate schema trước khi import
    const validated = BackupSchema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      throw new Error(`Cấu trúc file backup không hợp lệ:\n${issues.slice(0, 5).join('\n')}`);
    }

    const { assets, debts, transactions, categories } = validated.data.data;

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
