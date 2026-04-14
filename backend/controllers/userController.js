import crypto from 'crypto';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { asyncHandler, AppError } from '../utils/error.js';
import { ROLE_PERMISSIONS } from '../utils/constants.js';
import { logActivity } from '../utils/activity.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { q, role, status = 'all', page = 1, limit = 10 } = req.query;

  const filters = {};
  if (q) {
    filters.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }
  if (role) filters.role = role;
  if (status === 'active') filters.isActive = true;
  if (status === 'inactive') filters.isActive = false;
  if (status === 'blocked') filters.isBlocked = true;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
    User.countDocuments(filters)
  ]);

  res.json({ users, pagination: { total, page: Number(page), limit: Number(limit) } });
});

export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'user' } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already exists.', 409);

  const user = await User.create({ firstName, lastName, email, password, role });

  await logActivity({
    actor: req.user._id,
    action: 'user_created',
    entityType: 'User',
    entityId: String(user._id),
    metadata: { email: user.email, role: user.role },
    ip: req.ip
  });

  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.role && !ROLE_PERMISSIONS[updates.role]) {
    throw new AppError('Invalid role.', 400);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found.', 404);

  Object.assign(user, updates);
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user_updated',
    entityType: 'User',
    entityId: id,
    metadata: updates,
    ip: req.ip
  });

  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found.', 404);

  await logActivity({
    actor: req.user._id,
    action: 'user_deleted',
    entityType: 'User',
    entityId: id,
    metadata: { email: user.email },
    ip: req.ip
  });

  res.json({ message: 'User deleted.' });
});

export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found.', 404);

  user.isBlocked = !user.isBlocked;
  await user.save();

  await Notification.create({
    user: user._id,
    title: user.isBlocked ? 'Account blocked' : 'Account restored',
    message: user.isBlocked
      ? 'Your account has been temporarily blocked by admin.'
      : 'Your account has been unblocked and restored.',
    type: user.isBlocked ? 'error' : 'success'
  });

  await logActivity({
    actor: req.user._id,
    action: user.isBlocked ? 'user_blocked' : 'user_unblocked',
    entityType: 'User',
    entityId: id,
    ip: req.ip
  });

  res.json({ user });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw new AppError('User not found.', 404);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user_password_reset_requested',
    entityType: 'User',
    entityId: id,
    ip: req.ip
  });

  res.json({
    message: 'Reset token generated.',
    resetToken: process.env.NODE_ENV === 'development' ? rawToken : undefined
  });
});
