import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Admin';

  if (!email || !password) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD');

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    if (name) existing.name = name;
    await existing.save();
    console.log('Existing user elevated to admin');
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log('Admin user created');
  }
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
