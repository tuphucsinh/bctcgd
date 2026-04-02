const { Client } = require('pg');

async function testConnection(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Trying ${host}...`);
  const connectionString = `postgresql://postgres.rtdulnrpbrqyuexrzqam:@Zxcv15799@${host}:6543/postgres`;
  
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
    console.log(`Auth failed on ${region}: ${err.message}`);
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

  for (const r of regions) {
    await testConnection(r);
  }
}

run();
