import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: String,
    category: { type: String, required: true },
    tags: [String],
    isPublished: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
    publishedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model('BlogPost', blogPostSchema);
