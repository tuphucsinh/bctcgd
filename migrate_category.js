const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase Database...');
    await client.connect();
    
    console.log('Adding income_type column to categories...');
    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS income_type text;`);
    
    console.log('Updating ACTIVE income categories (Lương, Thưởng, Bán hàng, Khác)...');
    await client.query(`
      UPDATE categories 
      SET income_type = 'ACTIVE' 
      WHERE type = 'INCOME' AND name IN ('Lương', 'Thưởng', 'Bán hàng', 'Khác');
    `);
    
    console.log('Updating PASSIVE income categories (Tài chính, Cổ tức, Bất động sản, Lãi tiết kiệm)...');
    await client.query(`
      UPDATE categories 
      SET income_type = 'PASSIVE' 
      WHERE type = 'INCOME' AND name IN ('Tài chính', 'Cổ tức', 'Bất động sản', 'Lãi tiết kiệm');
    `);
    
    console.log('Fetching updated categories...');
    const result = await client.query(`SELECT name, type, income_type FROM categories WHERE type = 'INCOME'`);
    console.table(result.rows);
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

run();
