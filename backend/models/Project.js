import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    coverImage: String,
    galleryImages: [String],
    technologies: [String],
    clientName: String,
    projectDate: Date,
    liveLink: String,
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Project', projectSchema);
