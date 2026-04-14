import express from 'express';
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

const deleteImage = async (image) => {
  if (image?.publicId) {
    await cloudinary.uploader.destroy(image.publicId);
  }
};

router.get('/', asyncHandler(async (req, res) => {
  const {
    category, isActive, q, page = 1, limit = 10,
  } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
  if (q) filter.$text = { $search: q };

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 10, 1);

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await Product.findById(req.params.id);
  if (!data) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
}));

router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const data = await Product.create(req.body);
  res.status(201).json(data);
}));

router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const old = await Product.findById(req.params.id);
  if (!old) return res.status(404).json({ message: 'Product not found' });

  if (old.thumbnail?.publicId && req.body.thumbnail?.publicId && old.thumbnail.publicId !== req.body.thumbnail.publicId) {
    await deleteImage(old.thumbnail);
  }

  const oldGalleryIds = new Set((old.galleryImages || []).map((img) => img.publicId));
  const nextGalleryIds = new Set((req.body.galleryImages || []).map((img) => img.publicId));
  const removed = [...oldGalleryIds].filter((id) => !nextGalleryIds.has(id));
  await Promise.all(removed.map((id) => cloudinary.uploader.destroy(id)));

  const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(data);
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await deleteImage(product.thumbnail);
  await Promise.all((product.galleryImages || []).map((img) => deleteImage(img)));
  await product.deleteOne();
  res.json({ message: 'Deleted' });
}));

export default router;
