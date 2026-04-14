import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@saascore.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
    await mongoose.connection.close();
    return;
  }

  await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email,
    password,
    role: 'super_admin'
  });

  console.log('✅ Admin user seeded:', email);
  await mongoose.connection.close();
};

seedAdmin().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
