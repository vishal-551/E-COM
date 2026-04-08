import express from 'express';
import Category from '../models/Category.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', asyncHandler(async (_, res) => res.json(await Category.find().sort({ name: 1 }))));
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => res.status(201).json(await Category.create(req.body))));
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

export default router;
