import express from 'express';
import CartItem from '../models/CartItem.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id }).populate('product');
  res.json(items);
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, quantity = 1 } = req.body;
  const item = await CartItem.findOneAndUpdate(
    { user: req.user._id, product },
    { $set: { quantity } },
    { upsert: true, new: true, runValidators: true },
  ).populate('product');
  res.status(201).json(item);
}));

router.delete('/:productId', protect, asyncHandler(async (req, res) => {
  await CartItem.deleteOne({ user: req.user._id, product: req.params.productId });
  res.json({ message: 'Removed' });
}));

router.delete('/', protect, asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
}));

export default router;
