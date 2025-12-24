const { Client } = require('pg');

async function updateAdminRole() {
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

    // Update user role to admin
    console.log('Updating user role to admin...');
    const result = await client.query(
      `UPDATE users SET role = 'admin' WHERE phone = '+97699112244' RETURNING id, name, phone, role`,
    );

    if (result.rows.length > 0) {
      console.log('✅ User updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateAdminRole();
