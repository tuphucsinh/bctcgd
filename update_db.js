const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDb() {
  console.log("Checking categories...");
  const { data: cols, error: colErr } = await supabase.from('categories').select('is_passive').limit(1);
  if (colErr) {
    console.log("is_passive column does not exist. Please add it via SQL editor first if using direct connection.");
    // Supabase Javascript client can't directly ALTER TABLE if not using rpc, but let's check.
    console.log(colErr.message);
  } else {
    console.log("is_passive exists. Updating...");
    
    // Thu nhập chủ động
    const { error: err1 } = await supabase
      .from('categories')
      .update({ is_passive: false })
      .in('name', ['Lương', 'Thưởng']);
    if (err1) console.error("Error setting active income:", err1);

    // Thu nhập thụ động
    const { error: err2 } = await supabase
      .from('categories')
      .update({ is_passive: true })
      .eq('type', 'INCOME')
      .not('name', 'in', '("Lương","Thưởng")'); // Not exact syntax, let's do one by one or fetch all 

    // Better way: fetch all INCOME categories
    const { data: incomeCats } = await supabase.from('categories').select('*').eq('type', 'INCOME');
    if (incomeCats) {
      for (const c of incomeCats) {
         const passive = !(c.name.toLowerCase() === 'lương' || c.name.toLowerCase() === 'thưởng');
         await supabase.from('categories').update({ is_passive: passive }).eq('id', c.id);
      }
      console.log("Updated active/passive statuses.");
    }
  }
  process.exit(0);
}

updateDb();
