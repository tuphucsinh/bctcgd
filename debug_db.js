
import { createClient } from './src/utils/supabase/server.ts';

async function checkWallets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('is_system_cash_account', true);
  
  if (error) {
    console.error('Error fetching wallets:', error);
    return;
  }
  
  console.log('--- System Cash Accounts ---');
  data.forEach(a => {
    console.log(`ID: ${a.id}, Name: ${a.name}, Owner: ${a.owner}, Value: ${a.current_value}, Status: ${a.status}`);
  });
}

checkWallets();
