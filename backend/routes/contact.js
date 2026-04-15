import express from 'express';
import ContactEnquiry from '../models/ContactEnquiry.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => res.status(201).json(await ContactEnquiry.create(req.body))));
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { q = '', isRead } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
    ];
  }
  if (typeof isRead !== 'undefined') filter.isRead = isRead === 'true';
  res.json(await ContactEnquiry.find(filter).sort({ createdAt: -1 }));
}));
router.patch('/:id/read', protect, adminOnly, asyncHandler(async (req, res) => {
  const data = await ContactEnquiry.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead ?? true }, { new: true });
  res.json(data);
}));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await ContactEnquiry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

export default router;
