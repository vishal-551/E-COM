import express from 'express';
import User from '../models/User.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', protect, adminOnly, asyncHandler(async (_, res) => {
  res.json(await User.find().select('-password').sort({ createdAt: -1 }));
}));

router.patch('/:id/block', protect, adminOnly, asyncHandler(async (req, res) => {
  const data = await User.findByIdAndUpdate(req.params.id, { isBlocked: req.body.isBlocked ?? true }, { new: true }).select('-password');
  res.json(data);
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
}));

export default router;
