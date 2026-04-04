const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres:@Zxcv15799@[2406:da14:271:991e:1deb:c24:328e:94d7]:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Thêm cột 'is_passive' vào bảng categories
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS is_passive BOOLEAN DEFAULT false;
    `);

    // 2. Cập nhật nhóm THU NHẬP CHỦ ĐỘNG
    await client.query(`
      UPDATE categories 
      SET is_passive = false 
      WHERE type = 'INCOME' AND lower(name) IN ('lương', 'thưởng');
    `);

    // 3. Cập nhật nhóm THU NHẬP THỤ ĐỘNG
    await client.query(`
      UPDATE categories 
      SET is_passive = true 
      WHERE type = 'INCOME' AND lower(name) NOT IN ('lương', 'thưởng');
    `);

    const res = await client.query(`
      SELECT name, is_passive FROM categories WHERE type = 'INCOME' ORDER BY is_passive;
    `);
    console.table(res.rows);

  } catch (err) {
    console.error('Lỗi thực thi SQL:', err.message);
  } finally {
    await client.end();
  }
}

run();
