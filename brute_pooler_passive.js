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
  } catch (err) { }

  const connectionString5432 = `postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@${host}:5432/postgres`;
  const client2 = new Client({
    connectionString: connectionString5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client2.connect();
    console.log(`✅ Success with ${host} (5432)`);
    return { client: client2, host, port: 5432 };
  } catch (err) { }

  return null;
}

async function run() {
  const regions = ['ap-southeast-1'];

  let activeClient = null;
  for (const region of regions) {
    const res = await testConnection(region);
    if (res) {
      activeClient = res.client;
      break;
    }
  }

  if (!activeClient) {
    console.error('❌ Could not connect.');
    process.exit(1);
  }

  try {
    console.log('🛠️ Bổ sung is_passive...');
    await activeClient.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS is_passive BOOLEAN DEFAULT false;
    `);

    console.log('📝 Cập nhật THU NHẬP CHỦ ĐỘNG...');
    await activeClient.query(`
      UPDATE categories 
      SET is_passive = false 
      WHERE type = 'INCOME' AND lower(name) IN ('lương', 'thưởng');
    `);

    console.log('📝 Cập nhật THU NHẬP THỤ ĐỘNG...');
    await activeClient.query(`
      UPDATE categories 
      SET is_passive = true 
      WHERE type = 'INCOME' AND lower(name) NOT IN ('lương', 'thưởng');
    `);

    const res = await activeClient.query(`
      SELECT name, is_passive FROM categories WHERE type = 'INCOME' ORDER BY is_passive;
    `);
    console.table(res.rows);
    console.log('\n✨ Database đã được cập nhật thành công!');

  } catch (err) {
    console.error('❌ Lỗi thực thi SQL:', err.message);
  } finally {
    await activeClient.end();
  }
}

run();
