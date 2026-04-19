const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.setkvvodjbmfveqlzibt:InkomokoArchive2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
});

async function wipe() {
  try {
    await client.connect();
    console.log('Connected to Supabase. Wiping data...');
    
    const tables = [
      'users', 'families', 'family_members', 'stories', 
      'bookmarks', 'gratitudes', 'comments', 'play_history', 
      'notifications', 'user_settings'
    ];
    
    for (const table of tables) {
      await client.query(`TRUNCATE ${table} CASCADE;`);
      console.log(`- ${table} wiped.`);
    }
    
    console.log('All data wiped successfully.');
  } catch (err) {
    console.error('Wipe failed:', err);
  } finally {
    await client.end();
  }
}

wipe();
