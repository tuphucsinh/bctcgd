import { Client } from 'pg';
import fs from 'fs';

async function migrate() {
  const client = new Client({
    connectionString: "postgres://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" 
  });

  try {
    await client.connect();
    
    // Read and execute schema modifications
    const sql1 = `
      ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'ADJUSTMENT';
    `;
    await client.query(sql1);
    console.log("Updated transaction_type Enum.");

    const sql2 = fs.readFileSync('./migration.sql', 'utf8');
    await client.query(sql2);
    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
