import { Client } from 'pg';

async function migrate() {
  const client = new Client({
    user: 'postgres.rtdulnrpbrqyuexrzqam',
    password: '@Zxcv15799',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    
    await client.query(`
      ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_system_cash_account BOOLEAN DEFAULT FALSE;
      UPDATE assets SET is_system_cash_account = TRUE WHERE name = 'Tiền mặt' AND type = 'FINANCE';
    `);
    console.log("Migration successful port 5432.");
    await client.end();
    return;
  } catch (err) {
    console.error("Migration failed port 5432:", err);
    try { await client.end(); } catch (e) {}
    
    // retry with 6543
    const client2 = new Client({
      user: 'postgres.rtdulnrpbrqyuexrzqam',
      password: '@Zxcv15799',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
    });
    try {
        await client2.connect();
        await client2.query(`
          ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_system_cash_account BOOLEAN DEFAULT FALSE;
          UPDATE assets SET is_system_cash_account = TRUE WHERE name = 'Tiền mặt' AND type = 'FINANCE';
        `);
        console.log("Migration successful port 6543.");
    } catch(e) {
        console.error("Migration failed port 6543:", e);
    } finally {
        try { await client2.end(); } catch (e) {}
    }
  }
}

migrate();
