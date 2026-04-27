"use server";

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { handleActionError, ActionResult, getOwnerFilter } from './helpers';
import { revalidatePath } from 'next/cache';

export type AssetInput = {
  name: string;
  type: 'FINANCE' | 'REAL_ESTATE' | 'CRYPTO' | 'GOLD' | 'OTHER';
  asset_class: 'FIXED' | 'LIQUID';
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number; 
  notes?: string;
  created_at?: string; 
  icon?: string;
  color?: string;
  bank_name?: string;
};

export async function getAssets(page: number = 1, limit: number = 50) {
  const supabase = await createClient();
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[DATABASE_ERROR] getAssets:', error);
    return [];
  }
}

export async function createAsset(input: AssetInput): Promise<ActionResult> {
  try {
    const quantity = Number(input.quantity);
    const purchasePrice = Number(input.purchase_price);
    const currentPrice = Number(input.current_price);
    const currentValue = Number(input.current_value);

    if (isNaN(quantity) || isNaN(purchasePrice) || isNaN(currentPrice) || isNaN(currentValue)) {
      throw new Error("Dữ liệu dạng số không hợp lệ");
    }

    const toInsert = {
      name: input.name,
      type: input.type,
      asset_class: input.asset_class,
      quantity: quantity || 0,
      purchase_price: purchasePrice || 0, 
      current_price: currentPrice || 0,
      current_value: currentValue || 0, 
      notes: input.notes || "",
      created_at: input.created_at ? new Date(input.created_at).toISOString() : new Date().toISOString(),
      status: 'ACTIVE'
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .insert([toInsert])
      .select();

    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/assets');
    return { success: true, data };
  } catch (error) {
    return handleActionError('createAsset', error);
  }
}

export async function updateAsset(id: string, input: Partial<AssetInput>): Promise<ActionResult> {
  try {
    const toUpdate: Partial<AssetInput> = { ...input };
    if (toUpdate.quantity !== undefined || toUpdate.current_price !== undefined) {
      if (toUpdate.quantity !== undefined && toUpdate.current_price !== undefined) {
        toUpdate.current_value = Number(toUpdate.quantity) * Number(toUpdate.current_price);
      }
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .update(toUpdate)
      .eq('id', id)
      .select();

    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/assets');
    return { success: true, data };
  } catch (error) {
    return handleActionError('updateAsset', error);
  }
}

export async function sellAsset(
  id: string, 
  sellQuantity: number, 
  sellPrice: number, 
  currentAsset: { quantity: number, current_price: number, current_value: number, purchase_price?: number, type?: string, name?: string },
  userId?: string
): Promise<ActionResult> {
  try {
    // --- P0-4: Validation ---
    if (sellQuantity <= 0) {
      throw new Error("Số lượng bán phải lớn hơn 0");
    }
    if (sellQuantity > currentAsset.quantity) {
      throw new Error(`Số lượng bán (${sellQuantity}) không được vượt quá số lượng hiện có (${currentAsset.quantity})`);
    }
    if (sellPrice < 0) {
      throw new Error("Giá bán không được âm");
    }

    const remainingQty = currentAsset.quantity - sellQuantity;
    const isSellingAll = remainingQty <= 0;

    const updatePayload: Record<string, unknown> = isSellingAll
      ? { status: 'SOLD' }
      : { quantity: remainingQty, current_value: remainingQty * currentAsset.current_price };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;

    // Get category for transaction based on asset type
    let catName = 'Khác';
    if (currentAsset.type === 'REAL_ESTATE') catName = 'Bất động sản';
    else if (currentAsset.type === 'CRYPTO') catName = 'Crypto';
    else if (currentAsset.type === 'GOLD') catName = 'Vàng';
    else if (currentAsset.type === 'FINANCE') catName = 'Tài chính';

    // Owner từ userId được truyền vào, không hardcode
    const owner = getOwnerFilter(userId || 'gd', false) as string;

    const purchasePrice = currentAsset.purchase_price || 0;
    const profitOrLoss = sellQuantity * (sellPrice - purchasePrice);
    const totalCashAdded = sellQuantity * sellPrice;

    // --- P0-1: Atomic — dùng rpc_add_transaction thay vì log_transaction + adjustCashAmount riêng ---
    if (profitOrLoss !== 0) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', catName)
        // --- P1-2: Fix type — lãi -> INCOME, lỗ -> EXPENSE ---
        .eq('type', profitOrLoss >= 0 ? 'INCOME' : 'EXPENSE')
        .single();

      const { error: rpcErr } = await supabase.rpc('log_transaction', {
        p_amount: Math.abs(profitOrLoss),
        // P1-2: lỗ ghi EXPENSE thay vì INCOME âm
        p_type: profitOrLoss >= 0 ? 'INCOME' : 'EXPENSE',
        p_category_id: catData?.id || null,
        p_note: `${profitOrLoss > 0 ? 'Lãi' : 'Lỗ'} bán tài sản: ${currentAsset.name || 'Tài sản'} (${sellQuantity} đơn vị) | Giá bán: ${sellPrice}`,
        p_owner: owner,
        p_date: new Date().toISOString().split('T')[0]
      });

      if (rpcErr) throw rpcErr;
    }

    // Adjust cash qua RPC atomic (thử rpc_adjust_cash, fallback về adjustCashAmount)
    if (totalCashAdded > 0) {
      const { error: cashErr } = await supabase.rpc('rpc_adjust_cash', {
        p_delta: totalCashAdded
      });

      if (cashErr) {
        // Fallback: rpc chưa được tạo, dùng hàm cũ
        const resp = await adjustCashAmount(totalCashAdded);
        if (!resp.success) {
          console.error('FAILED TO UPDATE CASH AMOUNT ALTHOUGH ASSET WAS SOLD', resp.error);
        }
      }
    }

    revalidatePath('/');
    revalidatePath('/assets');
    return { success: true, data };
  } catch (error) {
    return handleActionError('sellAsset', error);
  }
}

export async function updateCashAmount(amount: number, userId?: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    
    const { data: existingArray, error: fetchErr } = await supabase
      .from('assets')
      .select('id, current_value')
      .eq('is_system_cash_account', true)
      .limit(1);

    if (fetchErr) throw fetchErr;
    const existing = existingArray && existingArray.length > 0 ? existingArray[0] : null;

    let delta = amount;

    if (existing) {
      delta = amount - Number(existing.current_value || 0);

      const { error } = await supabase
        .from('assets')
        .update({ 
          current_value: amount,
          purchase_price: amount,
          current_price: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const toInsert = {
        name: 'Tiền mặt',
        type: 'FINANCE',
        asset_class: 'LIQUID',
        quantity: 1,
        current_price: amount,
        purchase_price: amount,
        current_value: amount,
        status: 'ACTIVE',
        is_system_cash_account: true
      };

      const { error } = await supabase
        .from('assets')
        .insert([toInsert]);

      if (error) throw error;
    }

    if (delta !== 0) {
      await supabase.rpc('log_transaction', {
        p_amount: Math.abs(delta),
        p_type: 'ADJUSTMENT',
        p_category_id: null,
        p_note: `điều chỉnh tiền mặt: ${delta > 0 ? 'Tăng' : 'Giảm'}`,
        p_owner: getOwnerFilter(userId || 'gd', false),
        p_date: new Date().toISOString().split('T')[0]
      });
    }

    revalidatePath('/');
    return { success: true, data: null };
  } catch (error) {
    return handleActionError('updateCashAmount', error);
  }
}

export async function adjustCashAmount(delta: number): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    
    const { data: existingArray, error: fetchErr } = await supabase
      .from('assets')
      .select('id, current_value')
      .eq('is_system_cash_account', true)
      .limit(1);

    if (fetchErr) throw fetchErr;
    const existing = existingArray && existingArray.length > 0 ? existingArray[0] : null;

    if (existing) {
      const newAmount = Number(existing.current_value || 0) + delta;
      const { data, error } = await supabase
        .from('assets')
        .update({ 
          current_value: newAmount,
          current_price: newAmount,
          purchase_price: newAmount
        })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      revalidatePath('/');
      return { success: true, data };
    } else {
      const newAmount = delta;
      const toInsert = {
        name: 'Tiền mặt',
        type: 'FINANCE',
        asset_class: 'LIQUID',
        quantity: 1,
        current_price: newAmount,
        purchase_price: newAmount,
        current_value: newAmount,
        status: 'ACTIVE',
        is_system_cash_account: true
      };

      const { data, error } = await supabase
        .from('assets')
        .insert([toInsert])
        .select();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (error) {
    return handleActionError('adjustCashAmount', error);
  }
}
