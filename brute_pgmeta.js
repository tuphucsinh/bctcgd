const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZHVsbnJwYnJxeXVleHJ6cWFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTAzOTUzMSwiZXhwIjoyMDkwNjE1NTMxfQ.r8WLhHLfC5OMmkKDDJdRvTmxgPUqb1hvKUX96mdaBjc';
const url = 'https://rtdulnrpbrqyuexrzqam.supabase.co/pgmeta/default/query';

async function run() {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': key,
        'Authorization': 'Bearer ' + key,
      },
      body: JSON.stringify({ query: 'SELECT 1;' })
    });
    console.log(r.status);
    console.log(await r.text());
  } catch (e) {
    console.error(e);
  }
}

run();
