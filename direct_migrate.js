const { Client } = require('pg');
require('dotenv').config();

async function run() {
  // Thay đổi cách kết nối: dùng direct database URL (db.[project_ref].supabase.co) với user là postgres
  const connectionString = 'postgresql://postgres:@Zxcv15799@db.rtdulnrpbrqyuexrzqam.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🚀 Đang kết nối trực tiếp tới Postgres (db.rtdulnrpbrqyuexrzqam.supabase.co:5432)...');
    await client.connect();
    console.log('✅ Kết nối thành công!');

    // 1. Thêm cột 'income_type' vào bảng categories
    console.log('🛠️ Đang thêm cột income_type...');
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS income_type text;
    `);

    // 2. Cập nhật nhóm THU NHẬP CHỦ ĐỘNG
    console.log('📝 Đang cập nhật NHÓM CHỦ ĐỘNG...');
    await client.query(`
      UPDATE categories 
      SET income_type = 'ACTIVE' 
      WHERE type = 'INCOME' AND name IN ('Lương', 'Thưởng', 'Bán hàng', 'Khác');
    `);

    // 3. Cập nhật nhóm THU NHẬP THỤ ĐỘNG
    console.log('📝 Đang cập nhật NHÓM THỤ ĐỘNG...');
    await client.query(`
      UPDATE categories 
      SET income_type = 'PASSIVE' 
      WHERE type = 'INCOME' AND name IN ('Tài chính', 'Cổ tức', 'Bất động sản', 'Lãi tiết kiệm');
    `);

    // Kiểm tra kết quả
    const res = await client.query(`
      SELECT name, income_type FROM categories WHERE type = 'INCOME' ORDER BY income_type;
    `);
    console.log('\n📊 KẾT QUẢ PHÂN LOẠI:');
    console.table(res.rows);

    console.log('\n✨ Database đã được cập nhật thành công!');

  } catch (err) {
    console.error('❌ Lỗi thực thi SQL:', err.message);
  } finally {
    await client.end();
  }
}

run();
