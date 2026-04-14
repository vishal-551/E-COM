import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Readable } from 'stream';
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
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import { adminOnly, protect } from './middleware/auth.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import cloudinary from './config/cloudinary.js';
import { upload } from './middleware/upload.js';
import UploadAsset from './models/UploadAsset.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || '')
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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

const uploadBufferToCloudinary = (file, folder = 'ecom') => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
    if (err) return reject(err);
    return resolve(result);
  });
  Readable.from(file.buffer).pipe(stream);
});

app.get('/api/health', (_, res) => res.json({ ok: true, message: 'API running', env: process.env.NODE_ENV || 'development' }));

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
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

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
      Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
      User.find().sort({ createdAt: -1 }).limit(6).select('name email createdAt'),
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
    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
});

app.post('/api/upload/multiple', protect, adminOnly, upload.array('images', 8), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'Images are required' });
    const uploaded = await Promise.all(req.files.map((file) => uploadBufferToCloudinary(file, 'ecom')));
    await UploadAsset.insertMany(uploaded.map((item) => ({
      publicId: item.public_id,
      url: item.url,
      secureUrl: item.secure_url,
      uploadedBy: req.user._id,
      folder: 'ecom',
    })));

    res.status(201).json(uploaded.map((item) => ({ url: item.secure_url, publicId: item.public_id })));
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
