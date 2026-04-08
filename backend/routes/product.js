import express from 'express';
import Product from '../models/Product.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
  if (q) filter.$text = { $search: q };
  const data = await Product.find(filter).sort({ createdAt: -1 });
  res.json(data);
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
  const data = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(data);
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
