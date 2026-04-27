const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envCont = fs.readFileSync('.env', 'utf8');
const url = envCont.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envCont.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('is_system_cash_account', true)
    .limit(1);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log('Columns in assets record for Cash:');
  console.log(Object.keys(data[0]));
  console.log('Record content:', data[0]);
}

check();
