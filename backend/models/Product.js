import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  brand: { type: String, default: '', trim: true },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0, default: null },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, default: '', trim: true, uppercase: true },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  thumbnail: imageSchema,
  galleryImages: [imageSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text', sku: 'text' });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 });

export default mongoose.model('Product', productSchema);
