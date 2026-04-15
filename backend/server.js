import dotenv from 'dotenv';
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
import { upload } from './middleware/upload.js';
import UploadAsset from './models/UploadAsset.js';
import { uploadBufferToCloudinary } from './utils/media.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'e-com-api', timestamp: new Date().toISOString() });
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

connectDB()
  .then(async () => {
    if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
      const existing = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
      if (!existing) {
        const [firstName, ...rest] = (process.env.SEED_ADMIN_NAME || 'Super Admin').split(' ');
        await User.create({
          firstName,
          lastName: rest.join(' ') || 'User',
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log('Admin seeded');
      }
    }

    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
