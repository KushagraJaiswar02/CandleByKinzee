import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { Admin } from '../src/models/Admin.js';

const [email, password, role = 'owner'] = process.argv.slice(2);

if (!email || !password || password.length < 12) {
  console.error('Usage: npm run create-admin --workspace backend -- owner@example.com strong-password-12 owner');
  process.exit(1);
}

await connectDb();
const passwordHash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate(
  { email: email.toLowerCase() },
  { email: email.toLowerCase(), passwordHash, role },
  { upsert: true, new: true }
);
console.log(`Admin ready: ${email.toLowerCase()} (${role})`);
await disconnectDb();
