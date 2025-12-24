const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const client = new Client({
    host: 'ep-dry-bird-a1532ugc-pooler.ap-southeast-1.aws.neon.tech',
    port: 5432,
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_6gNKX3tMHmsf',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to Neon database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read and execute schema
    console.log('Running schema migration...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8',
    );
    await client.query(schemaSQL);
    console.log('Schema created successfully!');

    // Read and execute seed data
    console.log('Running seed data...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seeds', 'dev-seed.sql'),
      'utf8',
    );
    await client.query(seedSQL);
    console.log('Seed data inserted successfully!');

    console.log('\n✅ Neon database setup complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
