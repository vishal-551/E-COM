import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('ContactEnquiry', contactEnquirySchema);
