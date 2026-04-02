const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

  const findCat = (name) => categories.find(c => c.name === name)?.id || categories[0].id;

  const today = new Date();
  const getPastDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const sampleIncomes = [
    // Hiếu
    { amount: 25000000, type: 'INCOME', owner: 'HIEU', date: getPastDate(2), note: 'Lương tháng 03', category_id: findCat('Lương') },
    { amount: 5000000, type: 'INCOME', owner: 'HIEU', date: getPastDate(5), note: 'Thưởng dự án A', category_id: findCat('Thưởng') },
    { amount: 1200000, type: 'INCOME', owner: 'HIEU', date: getPastDate(10), note: 'Lãi tiết kiệm', category_id: findCat('Tài chính') },
    
    // Ly
    { amount: 18000000, type: 'INCOME', owner: 'LY', date: getPastDate(1), note: 'Lương tháng 03', category_id: findCat('Lương') },
    { amount: 3000000, type: 'INCOME', owner: 'LY', date: getPastDate(7), note: 'Tiền thuê nhà Q7', category_id: findCat('Bất động sản') },
    
    // Joint
    { amount: 10000000, type: 'INCOME', owner: 'JOINT', date: getPastDate(4), note: 'Quà biếu gia đình', category_id: findCat('Thu nhập khác') },
  ];

  const { data, error } = await supabase
    .from('transactions')
    .insert(sampleIncomes);

  if (error) {
    console.error('Lỗi khi chèn dữ liệu:', error);
  } else {
    console.log('Đã tạo thành công 6 bản ghi thu nhập mẫu!');
  }
}

seedData();
