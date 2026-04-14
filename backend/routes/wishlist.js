import express from 'express';
import WishlistItem from '../models/WishlistItem.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const items = await WishlistItem.find({ user: req.user._id }).populate('product');
  res.json(items);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { product } = req.body;
  const existing = await WishlistItem.findOne({ user: req.user._id, product });
  if (existing) {
    await existing.deleteOne();
    return res.json({ wished: false });
  }
  await WishlistItem.create({ user: req.user._id, product });
  return res.status(201).json({ wished: true });
}));

export default router;
