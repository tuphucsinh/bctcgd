const { Client } = require('pg');

async function testConnection(region, port) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const encodedPassword = encodeURIComponent('@Zxcv15799');
  const connectionString = `postgresql://postgres.rtdulnrpbrqyuexrzqam:${encodedPassword}@${host}:${port}/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`✅ Success with ${host} (${port})`);
    return { client, host, port };
  } catch (err) {
    if (err.message.includes('Tenant or user not found')) {
      // ignore
    } else {
      console.log(`Error on ${region} port ${port}: ${err.message}`);
    }
  }

  return null;
}

async function run() {
  const regions = [
    'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2', 'us-east-1', 'eu-central-1'
  ];

  for (const r of regions) {
    await testConnection(r, 5432);
    await testConnection(r, 6543);
  }
}

run();
