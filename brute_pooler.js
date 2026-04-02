const { Client } = require('pg');

async function testConnection(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying ${host}...`);
  const connectionString = `postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`✅ Success with ${host} (6543)`);
    return { client, host, port: 6543 };
  } catch (err) {
    // console.log(`Failed ${host} 6543: ${err.message}`);
  }

  // Try 5432
  const connectionString5432 = `postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@${host}:5432/postgres`;
  const client2 = new Client({
    connectionString: connectionString5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client2.connect();
    console.log(`✅ Success with ${host} (5432)`);
    return { client: client2, host, port: 5432 };
  } catch (err) {
    // console.log(`Failed ${host} 5432: ${err.message}`);
  }

  return null;
}

async function run() {
  const regions = [
    'ap-southeast-1', // Singapore
    'ap-northeast-1', // Tokyo
    'ap-southeast-2', // Sydney
    'ap-south-1',     // Mumbai
    'us-west-1',      // Northern California
    'us-east-1',      // N. Virginia
    'eu-central-1',   // Frankfurt
    'eu-west-1',      // Ireland
    'eu-west-2'       // London
  ];

  let activeClient = null;
  for (const region of regions) {
    const res = await testConnection(region);
    if (res) {
      activeClient = res.client;
      break;
    }
  }

  if (!activeClient) {
    console.error('❌ Could not connect to any pooler region.');
    process.exit(1);
  }

  try {
    // 1. Thêm cột 'income_type' vào bảng categories
    console.log('🛠️ Đang thêm cột income_type...');
    await activeClient.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS income_type text;
    `);

    // 2. Cập nhật nhóm THU NHẬP CHỦ ĐỘNG
    console.log('📝 Đang cập nhật NHÓM CHỦ ĐỘNG...');
    await activeClient.query(`
      UPDATE categories 
      SET income_type = 'ACTIVE' 
      WHERE type = 'INCOME' AND name IN ('Lương', 'Thưởng', 'Bán hàng', 'Khác');
    `);

    // 3. Cập nhật nhóm THU NHẬP THỤ ĐỘNG
    console.log('📝 Đang cập nhật NHÓM THỤ ĐỘNG...');
    await activeClient.query(`
      UPDATE categories 
      SET income_type = 'PASSIVE' 
      WHERE type = 'INCOME' AND name IN ('Tài chính', 'Cổ tức', 'Bất động sản', 'Lãi tiết kiệm');
    `);

    const res = await activeClient.query(`
      SELECT name, income_type FROM categories WHERE type = 'INCOME' ORDER BY income_type;
    `);
    console.log('\n📊 KẾT QUẢ PHÂN LOẠI:');
    console.table(res.rows);

    console.log('\n✨ Database đã được cập nhật thành công!');

  } catch (err) {
    console.error('❌ Lỗi thực thi SQL:', err.message);
  } finally {
    await activeClient.end();
  }
}

run();
