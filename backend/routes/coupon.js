import express from 'express';
import Coupon from '../models/Coupon.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', protect, adminOnly, asyncHandler(async (_, res) => res.json(await Coupon.find().sort({ createdAt: -1 }))));
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => res.status(201).json(await Coupon.create(req.body))));
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

router.post('/apply', asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: String(code || '').toUpperCase(), active: true });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });
  if (coupon.expiry && coupon.expiry.getTime() < Date.now()) return res.status(400).json({ message: 'Coupon expired' });
  if (Number(subtotal) < Number(coupon.minOrderAmount || 0)) return res.status(400).json({ message: 'Minimum order not met' });

  const discount = coupon.type === 'percentage'
    ? (Number(subtotal) * Number(coupon.value)) / 100
    : Number(coupon.value);

  return res.json({ coupon, discount: Math.min(discount, Number(subtotal)) });
}));

export default router;
