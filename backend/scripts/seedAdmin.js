import '../config/env.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const splitName = (name = 'Admin User') => {
  const [firstName, ...rest] = name.split(' ').filter(Boolean);
  return { firstName: firstName || 'Admin', lastName: rest.join(' ') || 'User' };
};

const run = async () => {
  await connectDB();
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Admin User';

  if (!email || !password) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD');

  const { firstName, lastName } = splitName(name);
  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    existing.role = 'admin';
    existing.firstName = firstName;
    existing.lastName = lastName;
    if (password) existing.password = password;
    await existing.save();
    console.log('Existing user elevated to admin');
  } else {
    await User.create({ firstName, lastName, email, password, role: 'admin' });
    console.log('Admin user created');
  }
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
