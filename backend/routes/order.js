import express from 'express';
import Order from '../models/Order.js';
import CartItem from '../models/CartItem.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.post('/', protect, asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    user: req.user._id,
    items: req.body.items || [],
    subtotal: req.body.subtotal || req.body.total,
    discountAmount: req.body.discountAmount || 0,
    shippingAmount: req.body.shippingAmount || 0,
  };
  const data = await Order.create(payload);
  await CartItem.deleteMany({ user: req.user._id });
  res.status(201).json(data);
}));

router.get('/mine', protect, asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
}));

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const {
    status, paymentStatus, q,
  } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (q) filter._id = { $regex: q, $options: 'i' };

  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email phone createdAt')
    .sort({ createdAt: -1 });
  res.json(orders);
}));

router.patch('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const {
    status, note = '', paymentStatus, courierPartner, trackingId, dispatchDate, estimatedDeliveryDate,
  } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (status) {
    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: req.user._id, at: new Date() });
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;

  if (status === 'Dispatched' || courierPartner || trackingId || dispatchDate || estimatedDeliveryDate) {
    order.dispatch = {
      courierPartner: courierPartner ?? order.dispatch?.courierPartner ?? '',
      trackingId: trackingId ?? order.dispatch?.trackingId ?? '',
      dispatchDate: dispatchDate ? new Date(dispatchDate) : order.dispatch?.dispatchDate,
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : order.dispatch?.estimatedDeliveryDate,
    };
  }

  await order.save();
  res.json(order);
}));

export default router;
