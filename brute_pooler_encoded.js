const { Client } = require('pg');

async function testConnection(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  // URL Encoded password
  const encodedPassword = encodeURIComponent('@Zxcv15799');
  const connectionString = `postgresql://postgres.rtdulnrpbrqyuexrzqam:${encodedPassword}@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`✅ Success with ${host} (6543)`);
    return { client, host, port: 6543 };
  } catch (err) {
    if (err.message.includes('Tenant or user not found')) {
      // console.log(`Not this region: ${region}`);
    } else {
      console.log(`Error on ${region}: ${err.message}`);
    }
  }

  return null;
}

async function run() {
  const regions = [
    'ap-southeast-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-2', 'ap-south-1',
    'us-west-1', 'us-east-1', 'us-east-2', 
    'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
    'sa-east-1', 'ca-central-1'
  ];

  let activeClient = null;
  for (const r of regions) {
    const res = await testConnection(r);
    if (res) {
      activeClient = res.client;
      break;
    }
  }

  if (!activeClient) {
    console.error('❌ Không thể kết nối DB trên bất kỳ region nào.');
    return;
  }

  try {
    console.log('🛠️ Đang thêm cột income_type...');
    await activeClient.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS income_type text;
    `);

    console.log('📝 Đang cập nhật NHÓM CHỦ ĐỘNG...');
    await activeClient.query(`
      UPDATE categories 
      SET income_type = 'ACTIVE' 
      WHERE type = 'INCOME' AND name IN ('Lương', 'Thưởng', 'Bán hàng', 'Khác');
    `);

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
