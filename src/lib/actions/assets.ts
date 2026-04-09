"use server";

import { createClient } from '@/utils/supabase/server';
import { handleActionError, ActionResult, getOwnerFilter } from './helpers';

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
    return []; // Giữ nguyên hành vi return array của UI cũ
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
    const remainingQty = currentAsset.quantity - sellQuantity;
    const isSellingAll = remainingQty <= 0;

    let updatePayload: Record<string, unknown> = {};

    if (isSellingAll) {
      updatePayload = { status: 'SOLD' };
    } else {
      updatePayload = { 
        quantity: remainingQty,
        current_value: remainingQty * currentAsset.current_price
      };
    }

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

    const { data: catData } = await supabase.from('categories').select('id').eq('name', catName).eq('type', 'INCOME').single();
    const category_id = catData?.id || null;

    // Determine owner from local context if possible, default 'HIEU' (via helpers)
    const owner = getOwnerFilter(userId || 'gd', false); // The schema has a constraint check_owner_no_joint

    // Calculate profit/loss
    const purchasePrice = currentAsset.purchase_price || 0;
    const profitOrLoss = sellQuantity * (sellPrice - purchasePrice);

    // Use Admin Client to bypass RLS for transaction logs
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert transaction
    if (profitOrLoss !== 0) {
      const { error: insertError } = await supabaseAdmin.from('transactions').insert({
        amount: profitOrLoss,
        type: 'INCOME',
        category_id: category_id,
        note: `${profitOrLoss > 0 ? 'Lãi' : 'Lỗ'} bán tài sản: ${currentAsset.name || 'Tài sản'} (${sellQuantity} đơn vị) | Giá bán: ${sellPrice}`,
        owner: owner,
        date: new Date().toISOString().split('T')[0]
      });

      if (insertError) {
        console.error('SELL_ASSET_INSERT_ERROR:', insertError);
        throw insertError;
      }
    }

    // Add total cash from the sale
    const totalCashAdded = sellQuantity * sellPrice;
    if (totalCashAdded > 0) {
      await adjustCashAmount(totalCashAdded);
    }

    return { success: true, data };
  } catch (error) {
    return handleActionError('sellAsset', error);
  }
}

export async function updateCashAmount(amount: number, userId?: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
      .from('assets')
      .select('id, current_value')
      .eq('type', 'FINANCE')
      .eq('name', 'Tiền mặt')
      .limit(1)
      .single();

    let delta = amount;

    if (existing) {
      delta = amount - Number(existing.current_value || 0);

      const { error } = await supabase
        .from('assets')
        .update({ 
          current_value: amount,
          purchase_price: amount
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
        status: 'ACTIVE'
      };

      const { error } = await supabase
        .from('assets')
        .insert([toInsert]);

      if (error) throw error;
    }

    if (delta !== 0) {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      await supabaseAdmin.from('transactions').insert([{
        amount: Math.abs(delta),
        type: 'ADJUSTMENT',
        note: `điều chỉnh tiền mặt: ${delta > 0 ? 'Tăng' : 'Giảm'}`,
        owner: getOwnerFilter(userId || 'gd', false),
        date: new Date().toISOString().split('T')[0]
      }]);
    }

    return { success: true, data: null };
  } catch (error) {
    return handleActionError('updateCashAmount', error);
  }
}

export async function adjustCashAmount(delta: number): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    
    // get current 
    const { data: existing } = await supabase
      .from('assets')
      .select('id, current_value')
      .eq('type', 'FINANCE')
      .eq('name', 'Tiền mặt')
      .limit(1)
      .single();

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
      return { success: true, data };
    } else {
      // If it doesn't exist, create it with delta as initial amount
      const newAmount = delta;
      const toInsert = {
        name: 'Tiền mặt',
        type: 'FINANCE',
        asset_class: 'LIQUID',
        quantity: 1,
        current_price: newAmount,
        purchase_price: newAmount,
        current_value: newAmount,
        status: 'ACTIVE'
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

