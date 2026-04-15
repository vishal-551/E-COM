import './config/env.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import bannerRoutes from './routes/banner.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import couponRoutes from './routes/coupon.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import { adminOnly, protect } from './middleware/auth.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import cloudinary from './config/cloudinary.js';
import mongoose from 'mongoose';
import { getAllowedOrigins, validateRuntimeEnv } from './config/env.js';
import { upload } from './middleware/upload.js';
import UploadAsset from './models/UploadAsset.js';
import { uploadBufferToCloudinary } from './utils/media.js';

const app = express();

const { errors: envValidationErrors, allowedOrigins } = validateRuntimeEnv();
if (envValidationErrors.length) {
  console.error('❌ Invalid environment configuration:');
  envValidationErrors.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

const redactMongoUri = (uri) => uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

const healthPayload = () => ({
  ok: mongoose.connection.readyState === 1,
  service: 'e-com-api',
  env: process.env.NODE_ENV || 'development',
  uptimeSeconds: Math.round(process.uptime()),
  dbState: mongoose.connection.readyState,
  timestamp: new Date().toISOString(),
});

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_, res) => {
  const payload = healthPayload();
  if (!payload.ok) {
    return res.status(503).json(payload);
  }
  return res.json(payload);
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/api/admin/analytics', protect, adminOnly, async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      orderStats,
      totalProducts,
      lowStockCount,
      latestOrders,
      latestCustomers,
      sales,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'firstName lastName email'),
      User.find().sort({ createdAt: -1 }).limit(6).select('firstName lastName email createdAt'),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, value: { $sum: '$total' } } }]),
    ]);

    const byStatus = Object.fromEntries(orderStats.map((item) => [item._id, item.count]));

    res.json({
      totalSales: sales[0]?.value || 0,
      totalOrders,
      pendingOrders: byStatus.Pending || 0,
      dispatchedOrders: byStatus.Dispatched || 0,
      deliveredOrders: byStatus.Delivered || 0,
      cancelledOrders: byStatus.Cancelled || 0,
      totalProducts,
      lowStockCount,
      totalUsers,
      latestOrders,
      latestCustomers,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upload/single', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });
    const result = await uploadBufferToCloudinary(req.file, 'ecom');
    await UploadAsset.create({
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      uploadedBy: req.user._id,
      folder: 'ecom',
    });
    return res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/upload', protect, adminOnly, async (req, res, next) => {
  try {
    const assets = await UploadAsset.find().sort({ createdAt: -1 }).limit(200);
    res.json(assets);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/upload/:publicId', protect, adminOnly, async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    await UploadAsset.deleteOne({ publicId: req.params.publicId });
    res.json({ message: 'Deleted image' });
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

const seedAdminIfConfigured = async () => {
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) return;

  const existing = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
  if (existing) return;

  const [firstName, ...rest] = (process.env.SEED_ADMIN_NAME || 'Super Admin').split(' ');
  await User.create({
    firstName,
    lastName: rest.join(' ') || 'User',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log('Admin seeded');
};

let hasSeededAdmin = false;
const connectWithRetry = async () => {
  try {
    await connectDB();
    if (!hasSeededAdmin) {
      await seedAdminIfConfigured();
      hasSeededAdmin = true;
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed. Retrying in 5 seconds.');
    console.error(error?.message || error);
    setTimeout(connectWithRetry, 5000);
  }
};

app.listen(PORT, () => {
  console.log(`✅ API listening on port ${PORT}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  if (mongoUri) {
    console.log(`🗄️ Mongo target: ${redactMongoUri(mongoUri)}`);
  }
});

connectWithRetry();
