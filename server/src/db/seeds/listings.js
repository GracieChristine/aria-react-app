import pool from '../pool.js';
import { seedListings } from '../../dev/seedService.js';

const emailArg = process.argv.find((a) => a.startsWith('--email='));
if (!emailArg) {
  console.error('❌ Usage: node listings.js --email=host@example.com');
  process.exit(1);
}
const email = emailArg.split('=')[1];

async function run() {
  const { rows: users } = await pool.query(
    'SELECT id, first_name, last_name, role FROM users WHERE email = $1',
    [email]
  );
  if (users.length === 0) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }
  const host = users[0];
  if (!['host', 'admin', 'super_admin'].includes(host.role)) {
    console.error(`❌ User ${email} is not a host (role: ${host.role}). Become a host first.`);
    process.exit(1);
  }

  const result = await seedListings(host.id, host.first_name, host.last_name);
  if (!result.ok) {
    console.error(`❌ ${result.message}`);
    process.exit(1);
  }
  console.log(`✅ ${result.message}`);
  await pool.end();
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
