const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedExpenses() {
  console.log('--- Đang tạo dữ liệu mẫu Chi tiêu ---');
  
  // 1. Lấy tất cả danh mục CHI TIÊU
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'EXPENSE');

  if (catError || !categories || categories.length === 0) {
    console.error('Không tìm thấy danh mục chi tiêu nào!', catError);
    return;
  }

  console.log('Danh mục tìm thấy:', categories.map(c => c.name).join(', '));

  const findCat = (name) => {
    const cat = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return cat ? cat.id : categories[0].id; // Trả về cái đầu tiên nếu không khớp
  };

  const today = new Date();
  const getPastDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const sampleExpenses = [
    // 1. Ăn uống - Hiếu
    { amount: 550000, type: 'EXPENSE', owner: 'HIEU', date: getPastDate(0), note: 'Ăn tối ngoài tiệm', category_id: findCat('Ăn uống') },
    // 2. Di chuyển - Hiếu
    { amount: 120000, type: 'EXPENSE', owner: 'HIEU', date: getPastDate(1), note: 'Grab đi làm', category_id: findCat('Di chuyển') },
    // 3. Nhà cửa - Joint
    { amount: 3500000, type: 'EXPENSE', owner: 'JOINT', date: getPastDate(2), note: 'Tiền điện nước tháng 03', category_id: findCat('Nhà cửa') },
    // 4. Mua sắm - Ly
    { amount: 1250000, type: 'EXPENSE', owner: 'LY', date: getPastDate(3), note: 'Mỹ phẩm skincare', category_id: findCat('Mua sắm') },
    // 5. Giải trí - Ly
    { amount: 480000, type: 'EXPENSE', owner: 'LY', date: getPastDate(4), note: 'Vé xem phim & Bắp nước', category_id: findCat('Giải trí') },
    // 6. Giáo dục - Joint
    { amount: 2000000, type: 'EXPENSE', owner: 'JOINT', date: getPastDate(5), note: 'Học phí khóa tiếng Anh', category_id: findCat('Giáo dục') },
    // 7. Sức khỏe - Hiếu
    { amount: 320000, type: 'EXPENSE', owner: 'HIEU', date: getPastDate(6), note: 'Mua thực phẩm chức năng', category_id: findCat('Sức khỏe') },
    // 8. Ăn uống - Joint
    { amount: 850000, type: 'EXPENSE', owner: 'JOINT', date: getPastDate(7), note: 'Đi siêu thị cuối tuần', category_id: findCat('Ăn uống') },
    // 9. Shopping - Ly
    { amount: 950000, type: 'EXPENSE', owner: 'LY', date: getPastDate(8), note: 'Mua quần áo mới', category_id: findCat('Mua sắm') },
    // 10. Khác - Hiếu
    { amount: 200000, type: 'EXPENSE', owner: 'HIEU', date: getPastDate(9), note: 'Cắt tóc', category_id: findCat('Khác') }
  ];

  console.log('Đang chèn dữ liệu chi tiêu...');
  const { data, error } = await supabase
    .from('transactions')
    .insert(sampleExpenses);

  if (error) {
    console.error('Lỗi khi chèn dữ liệu:', error);
  } else {
    console.log('Đã tạo thành công 10 bản ghi chi tiêu mẫu!');
  }
}

seedExpenses();
