import express from 'express';
import Order from '../models/Order.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.post('/', protect, asyncHandler(async (req, res) => {
  const data = await Order.create({ ...req.body, user: req.user._id });
  res.status(201).json(data);
}));

router.get('/mine', protect, asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
}));

router.get('/', protect, adminOnly, asyncHandler(async (_, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
}));

router.patch('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const data = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(data);
}));

export default router;
