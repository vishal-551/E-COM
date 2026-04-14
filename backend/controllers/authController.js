import crypto from 'crypto';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler, AppError } from '../utils/error.js';
import { logActivity } from '../utils/activity.js';

const userResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isBlocked: user.isBlocked,
  isActive: user.isActive,
  subscription: user.subscription,
  createdAt: user.createdAt
});

export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered.', 409);

  const user = await User.create({ firstName, lastName, email, password });
  const token = signToken(user);

  await Notification.create({
    user: user._id,
    title: 'Welcome aboard',
    message: 'Your account is active and ready to use.',
    type: 'success'
  });

  await logActivity({
    actor: user._id,
    action: 'user_created',
    entityType: 'User',
    entityId: String(user._id),
    ip: req.ip
  });

  res.status(201).json({ token, user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) throw new AppError('Invalid credentials.', 401);

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new AppError('Invalid credentials.', 401);
  if (user.isBlocked || !user.isActive) throw new AppError('Account unavailable.', 403);

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  await logActivity({
    actor: user._id,
    action: 'user_logged_in',
    entityType: 'Auth',
    entityId: String(user._id),
    ip: req.ip
  });

  res.json({ token, user: userResponse(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.json({ message: 'If account exists, reset instructions are generated.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  await Notification.create({
    user: user._id,
    title: 'Password reset requested',
    message: 'A reset request was submitted for your account.',
    type: 'warning'
  });

  res.json({
    message: 'Password reset token generated (integrate email provider to send this).',
    resetToken: process.env.NODE_ENV === 'development' ? rawToken : undefined
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw new AppError('Token invalid or expired.', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await logActivity({
    actor: user._id,
    action: 'password_reset',
    entityType: 'Auth',
    entityId: String(user._id),
    ip: req.ip
  });

  res.json({ message: 'Password reset successful.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
