import express from 'express';
import Banner from '../models/Banner.js';
import cloudinary from '../config/cloudinary.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', asyncHandler(async (_, res) => res.json(await Banner.find().sort({ order: 1, createdAt: -1 }))));
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => res.status(201).json(await Banner.create(req.body))));
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const current = await Banner.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Banner not found' });
  if (current.image?.publicId && req.body.image?.publicId && current.image.publicId !== req.body.image.publicId) {
    await cloudinary.uploader.destroy(current.image.publicId);
  }
  res.json(await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
}));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  if (banner.image?.publicId) await cloudinary.uploader.destroy(banner.image.publicId);
  await banner.deleteOne();
  res.json({ message: 'Deleted' });
}));

export default router;
