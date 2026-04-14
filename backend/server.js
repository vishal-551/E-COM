import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './utils/error.js';
import authRoutes from './routes/auth.js';
import cmsRoutes from './routes/cms.js';
import publicRoutes from './routes/public.js';
import Admin from './models/Admin.js';

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

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'agency-cms-api' }));
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api', cmsRoutes);

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
  });
