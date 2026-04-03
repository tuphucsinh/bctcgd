const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log('--- Starting Migration: JOINT to HIEU ---');

  // 1. Transactions
  const { data: trx, error: errTrx } = await supabase
    .from('transactions')
    .update({ owner: 'HIEU' })
    .eq('owner', 'JOINT')
    .select();
  
  if (errTrx) console.error('Error migrating transactions:', errTrx);
  else console.log(`Migrated ${trx?.length || 0} transactions.`);

  // 2. Debts (Bảng này có cột owner)
  const { data: debts, error: errDebts } = await supabase
    .from('debts')
    .update({ owner: 'HIEU' })
    .eq('owner', 'JOINT')
    .select();

  if (errDebts) console.error('Error migrating debts:', errDebts);
  else console.log(`Migrated ${debts?.length || 0} debts.`);

  console.log('--- Migration Finished ---');
}

migrate();
