import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './utils/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import reviewRoutes from './routes/review.js';
import contactRoutes from './routes/contact.js';
import bannerRoutes from './routes/banner.js';
import couponRoutes from './routes/coupon.js';
import settingsRoutes from './routes/settings.js';
import { adminOnly, protect } from './middleware/auth.js';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*' }));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_, res) => res.json({ ok: true, message: 'API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/admin/analytics', protect, adminOnly, async (req, res, next) => {
  try {
    const [users, orders, revenueRow, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
    ]);

    res.json({
      totalUsers: users,
      totalOrders: orders,
      totalRevenue: revenueRow[0]?.revenue || 0,
      recentActivity: recentOrders.map((o) => ({ id: o._id, user: o.user?.name || 'User', total: o.total, status: o.status, createdAt: o.createdAt })),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upload', protect, adminOnly, (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required (Cloudinary URL or public URL).' });
  return res.status(201).json({ url: imageUrl });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
      const existing = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
      if (!existing) {
        await User.create({
          name: process.env.SEED_ADMIN_NAME || 'Admin',
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log('Seeded admin user');
      }
    }
    app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
  })
  .catch((e) => {
    if (mongoose.connection.readyState !== 1) console.error(e);
    process.exit(1);
  });
