import express from 'express';
import Banner from '../models/Banner.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', asyncHandler(async (_, res) => res.json(await Banner.find().sort({ order: 1, createdAt: -1 }))));
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => res.status(201).json(await Banner.create(req.body))));
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => res.json(await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => { await Banner.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

export default router;
