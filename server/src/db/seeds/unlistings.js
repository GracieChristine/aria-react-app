import pool from '../pool.js';
import { unseedListings } from '../../dev/seedService.js';

const emailArg = process.argv.find((a) => a.startsWith('--email='));
if (!emailArg) {
  console.error('❌ Usage: node unlistings.js --email=host@example.com');
  process.exit(1);
}
const email = emailArg.split('=')[1];

async function run() {
  const { rows: users } = await pool.query(
    'SELECT id, first_name, last_name FROM users WHERE email = $1',
    [email]
  );
  if (users.length === 0) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }
  const host = users[0];

  const result = await unseedListings(host.id);
  if (!result.ok) {
    console.error(`❌ ${result.message}`);
    process.exit(1);
  }
  console.log(`✅ ${result.message}`);
  await pool.end();
}

run().catch((err) => {
  console.error('❌ Unseed failed:', err);
  process.exit(1);
});
