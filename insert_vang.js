const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('categories').select('*').eq('type', 'INCOME');
  
  const vang = data.find(c => c.name === 'Vàng');
  if (vang) {
    console.log('Vàng already exists');
  } else {
    const { data: inserted, error: insertErr } = await supabase.from('categories').insert({ name: 'Vàng', type: 'INCOME', is_passive: true, icon: 'coins' });
    console.log('Inserted Vàng', insertErr);
  }
}
run();
