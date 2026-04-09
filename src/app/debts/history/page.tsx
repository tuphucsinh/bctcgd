import { createClient } from '@/utils/supabase/server';
import HistoryClient from './history-client';

export const dynamic = 'force-dynamic';

export default async function DebtsHistoryPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;

  const typeParam = typeof resolvedParams?.type === 'string' ? resolvedParams.type : 'LIA';
  const targetType = typeParam === 'REC' ? 'LEND' : 'BORROW';
  const labelText = typeParam === 'REC' ? 'Cho vay' : 'Nợ phải trả';

  // 1. Fetch debts corresponding to the type
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('debt_type', targetType);

  const debtIds = (debts || []).map(d => d.id);
  
  // 2. Fetch transactions linked to these debts
  let transactions: Array<{
    id: string;
    note: string | null;
    amount: number | string;
    created_at?: string;
    date: string;
  }> = [];
  if (debtIds.length > 0) {
    const { data: trans } = await supabase
      .from('transactions')
      .select('*')
      .in('linked_debt_id', debtIds);
    if (trans) transactions = trans;
  }

  const historyData: Array<{
    id: string;
    action: 'MỞ / THÊM MỚI' | 'THANH TOÁN' | 'TRẢ LÃI' | 'TRẢ GỐC' | 'HỒI VỐN';
    name: string;
    amount: number;
    date: string;
    note: string;
  }> = [];

  // Parse Open Debt
  for (const debt of (debts || [])) {
    historyData.push({
      id: `open_${debt.id}`,
      action: 'MỞ / THÊM MỚI',
      name: debt.name,
      amount: Number(debt.initial_principal),
      date: debt.created_at,
      note: debt.note || ''
    });
  }

  // Parse Payments/Interests
  for (const trans of transactions) {
    let action: 'MỞ / THÊM MỚI' | 'THANH TOÁN' | 'TRẢ LÃI' | 'TRẢ GỐC' | 'HỒI VỐN' = 'THANH TOÁN';
    let shortName = trans.note || '';
    
    if (trans.note && trans.note.includes('Trả lãi')) {
      action = 'TRẢ LÃI';
      shortName = trans.note.split(':')[1]?.trim() || trans.note;
    } else if (trans.note && trans.note.includes('Trả gốc')) {
      action = 'TRẢ GỐC';
      shortName = trans.note.split(':')[1]?.trim() || trans.note;
    } else if (trans.note && trans.note.includes('Hồi vốn')) {
      action = 'HỒI VỐN';
      shortName = trans.note.split(':')[1]?.trim() || trans.note;
    }

    historyData.push({
      id: `trans_${trans.id}`,
      action: action,
      name: shortName,
      amount: Number(trans.amount),
      date: trans.created_at || trans.date,
      note: ''
    });
  }

  // Sort descending by date
  historyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <HistoryClient data={historyData} typeLabel={labelText} />;
}
