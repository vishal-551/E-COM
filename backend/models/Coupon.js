import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['fixed', 'percentage'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  expiry: { type: Date, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.index({ code: 1, active: 1 });

export default mongoose.model('Coupon', couponSchema);
