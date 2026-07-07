import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    
    console.log('--- USERS ---');
    const usersRes = await client.query('SELECT id, username, email, name, role FROM users');
    console.log(usersRes.rows);
    
    console.log('\n--- DONATIONS ---');
    const donationsRes = await client.query('SELECT id, user_id as "userId", category_id as "categoryId", campaign_id as "campaignId", amount, name, email, phone, status, payment_id as "paymentId" FROM donations');
    console.log(donationsRes.rows);
    
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

run();
