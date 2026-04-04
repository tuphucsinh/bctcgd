"use server";

import { createClient } from '@/utils/supabase/server';
import { handleActionError, ActionResult } from './helpers';

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

export async function getAssets() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[DATABASE_ERROR] getAssets:', error);
    return []; // Giữ nguyên hành vi return array của UI cũ
  }
}

export async function createAsset(input: AssetInput): Promise<ActionResult> {
  try {
    const toInsert = {
      name: input.name,
      type: input.type,
      asset_class: input.asset_class,
      quantity: Number(input.quantity) || 0,
      purchase_price: Number(input.purchase_price) || 0, 
      current_price: Number(input.current_price) || 0,
      current_value: Number(input.current_value) || 0, 
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
  currentAsset: { quantity: number, current_price: number, current_value: number }
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
    return { success: true, data };
  } catch (error) {
    return handleActionError('sellAsset', error);
  }
}
