import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');
    
    console.log('Altering table receipt_settings to add org_email column if not exists...');
    await client.query(`
      ALTER TABLE receipt_settings ADD COLUMN IF NOT EXISTS org_email TEXT NOT NULL DEFAULT 'donations@iskconjuhu.in'
    `);
    console.log('org_email column added successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
