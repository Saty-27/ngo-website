import pg from 'pg';

// Connect to the default 'postgres' database
const client = new pg.Client({
  connectionString: 'postgresql://postgres:12345678@localhost:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    // Check if iskcon_juhu database exists
    const checkDbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'iskcon_juhu'");
    if (checkDbRes.rowCount === 0) {
      console.log('Creating database iskcon_juhu...');
      await client.query('CREATE DATABASE iskcon_juhu');
      console.log('Database iskcon_juhu created successfully!');
    } else {
      console.log('Database iskcon_juhu already exists.');
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    await client.end();
  }
}

run();
