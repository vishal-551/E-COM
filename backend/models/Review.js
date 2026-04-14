import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
