import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    budget: String,
    timeline: String,
    service: String,
    details: { type: String, required: true },
    status: { type: String, enum: ['new', 'reviewed', 'quoted', 'closed'], default: 'new' },
  },
  { timestamps: true },
);

export default mongoose.model('QuoteRequest', quoteRequestSchema);
