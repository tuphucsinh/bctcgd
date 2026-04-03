import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('--- Đang tạo dữ liệu mẫu Thu nhập ---');
  
  // 1. Lấy danh mục thu nhập
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'INCOME');

  if (!categories || categories.length === 0) {
    console.error('Không tìm thấy danh mục thu nhập nào!');
    return;
  }

  const hieuId = 'hieu';
  const lyId = 'ly';

  const incomeTransactions = [
    {
      amount: 15000000,
      type: 'INCOME',
      category_id: categories.find(c => c.name === 'Lương')?.id,
      note: 'Lương tháng 3',
      owner: 'HIEU',
      user_id: hieuId,
      date: new Date().toISOString(),
    },
    {
      amount: 12000000,
      type: 'INCOME',
      category_id: categories.find(c => c.name === 'Lương')?.id,
      note: 'Lương tháng 3',
      owner: 'LY',
      user_id: lyId,
      date: new Date().toISOString(),
    },
    {
      amount: 2000000,
      type: 'INCOME',
      category_id: categories.find(c => c.name === 'Thưởng' || c.name === 'Khác')?.id,
      note: 'Thưởng dự án',
      owner: 'HIEU',
      user_id: hieuId,
      date: new Date().toISOString(),
    }
  ];

  const { error } = await supabase
    .from('transactions')
    .insert(incomeTransactions);

  if (error) {
    console.error('Lỗi khi chèn dữ liệu:', error);
  } else {
    console.log('Đã tạo thành công dữ liệu mẫu thu nhập!');
  }
}

seedData();
