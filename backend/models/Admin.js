import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastLoginAt: { type: Date },
  permissions: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
