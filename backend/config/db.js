import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not configured.');

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV !== 'production',
    });
  } catch (error) {
    if (mongoUri.includes('127.0.0.1') && error?.message?.includes('ECONNREFUSED')) {
      error.message = `${error.message}\nHint: start local MongoDB on 127.0.0.1:27017 or set MONGO_URI to your Atlas connection string.`;
    }
    throw error;
  }

  console.log('✅ MongoDB connected');
};

export { connectDB };
export default connectDB;
