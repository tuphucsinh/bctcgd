const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('categories').select('*').eq('type', 'INCOME');
  console.log('Current income categories:', data.map(d => d.name));
  
  const cotuc = data.find(c => c.name === 'Cổ tức');
  if (cotuc) {
    const { data: updated, error: updateErr } = await supabase.from('categories').update({ name: 'Crypto', is_passive: true, icon: 'bitcoin' }).eq('id', cotuc.id);
    console.log('Updated Cổ tức to Crypto', updateErr);
  } else {
    // maybe it doesn't exist?
    const { data: inserted, error: insertErr } = await supabase.from('categories').insert({ name: 'Crypto', type: 'INCOME', is_passive: true, icon: 'bitcoin' });
    console.log('Inserted Crypto', insertErr);
  }
}
run();
