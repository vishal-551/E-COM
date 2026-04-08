import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => res.status(201).json(await ContactMessage.create(req.body))));
router.get('/', protect, adminOnly, asyncHandler(async (_, res) => res.json(await ContactMessage.find().sort({ createdAt: -1 }))));
router.patch('/:id/read', protect, adminOnly, asyncHandler(async (req, res) => {
  const data = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead ?? true }, { new: true });
  res.json(data);
}));

export default router;
