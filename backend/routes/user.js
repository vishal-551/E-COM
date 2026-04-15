import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const filter = q ? {
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

  const orderCounts = await Order.aggregate([
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(orderCounts.map((i) => [String(i._id), i.count]));

  res.json(users.map((u) => ({
    ...u.toObject(),
    name: `${u.firstName} ${u.lastName}`.trim(),
    orderCount: countMap[String(u._id)] || 0,
  })));
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
