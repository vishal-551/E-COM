import mongoose from 'mongoose';

const projectImageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    imageUrl: { type: String, required: true },
    altText: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('ProjectImage', projectImageSchema);
