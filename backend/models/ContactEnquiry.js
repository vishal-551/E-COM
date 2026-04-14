import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'in_progress', 'closed'], default: 'new' },
  },
  { timestamps: true },
);

export default mongoose.model('ContactEnquiry', contactEnquirySchema);
