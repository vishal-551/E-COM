import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './utils/error.js';
import authRoutes from './routes/auth.js';
import cmsRoutes from './routes/cms.js';
import publicRoutes from './routes/public.js';
import Admin from './models/Admin.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
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
}));

app.use(express.json({ limit: '10mb' }));

const corsOptions = {
  origin: process.env.CLIENT_URL?.split(',') || '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'agency-cms-api' }));
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', cmsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
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
      const exists = await Admin.findOne({ email: process.env.SEED_ADMIN_EMAIL });
      if (!exists) {
        await Admin.create({
          name: process.env.SEED_ADMIN_NAME || 'Super Admin',
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
const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 API server running on port ${port}`);
  });
};

startServer();
