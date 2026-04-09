import { createClient } from '@/utils/supabase/server';
import HistoryClient from './history-client';

export const dynamic = 'force-dynamic';

export default async function AssetsHistoryPage() {
  const supabase = await createClient();

  // 1. Fetch assets (for MUA actions)
  const { data: assets } = await supabase.from('assets').select('*');

  // 2. Fetch transactions related to assets (for BÁN actions or profit updates)
  // Assuming 'Bán tài sản' is logged in the `note` field.
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(name, type, icon)')
    .or('note.ilike.%Bán tài sản%,note.ilike.%Cập nhật tài sản%')
    .order('date', { ascending: false });

  const historyData: Array<{
    id: string;
    action: 'MUA' | 'BÁN' | 'CẬP NHẬT';
    name: string;
    type: string;
    amount: number;
    quantity: number | null;
    price: number | null;
    date: string;
    note: string;
  }> = [];

  // Parsing Asset Buys
  for (const asset of (assets || [])) {
    historyData.push({
      id: `buy_${asset.id}`,
      action: 'MUA',
      name: asset.name,
      type: asset.type,
      amount: Number(asset.purchase_price) * Number(asset.quantity),
      quantity: Number(asset.quantity),
      price: Number(asset.purchase_price),
      date: asset.created_at,
      note: asset.notes || '',
    });
  }

    // Parsing Transactions (Sells or Updates)
    for (const trans of (transactions || [])) {
      let action: 'MUA' | 'BÁN' | 'CẬP NHẬT' = 'BÁN';
      let name = trans.note;
      let quantity = null;
      let price = null;
      let displayAmount = Number(trans.amount);
      
      if (trans.note && (trans.note.includes('Bán tài sản:') || trans.note.includes('bán tài sản:'))) {
        action = 'BÁN';
        // Extract name and quantity
        const nameMatch = trans.note.match(/(?:Lãi|Lỗ)?\s*bán tài sản:\s*(.*?)\s*\((\d+(?:\.\d+)?)\s*đơn vị\)/i);
        if (nameMatch) {
          name = nameMatch[1];
          quantity = Number(nameMatch[2]);
        }

        // Extract price if available in the new format "| Giá bán: 123"
        const priceMatch = trans.note.match(/Giá bán:\s*(\d+(?:\.\d+)?)/);
        if (priceMatch) {
          price = Number(priceMatch[1]);
          if (quantity) {
            displayAmount = quantity * price;
          }
        }
      } else if (trans.note && trans.note.includes('Cập nhật tài sản')) {
          action = 'CẬP NHẬT';
      }

      historyData.push({
        id: `trans_${trans.id}`,
        action: action,
        name: name,
        type: 'OTHER',
        amount: displayAmount,
        quantity: quantity,
        price: price,
        date: trans.created_at || trans.date,
        note: trans.note || '',
      });
    }

  // Sort descending by date
  historyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <HistoryClient data={historyData} />;
}
