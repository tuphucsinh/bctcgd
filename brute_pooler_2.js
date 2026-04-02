const { Client } = require('pg');

async function testConnection(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying ${host}...`);
  const connectionString = `postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase external connections
  });

  try {
    await client.connect();
    console.log(`✅ Success with ${host} (6543)`);
    return { client, host, port: 6543 };
  } catch (err) {
    if (err.message.includes('password authentication failed') || err.message.includes('Tenant or user not found')) {
      console.log(`Auth failed on ${region}: ${err.message}`);
    } else {
      console.log(`Error on ${region}: ${err.message}`);
    }
  }

  return null;
}

async function run() {
  await testConnection('ap-southeast-1');
}

run();
