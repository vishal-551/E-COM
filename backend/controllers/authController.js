import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/error.js';

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email, password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, phone });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ token, user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password)) || user.isBlocked) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: userResponse(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If the email exists, reset instructions were generated.' });

  await PasswordResetToken.deleteMany({ user: user._id });
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await PasswordResetToken.create({ user: user._id, tokenHash, expiresAt });

  res.json({
    message: 'Password reset token generated. Integrate with your mail provider in production.',
    resetToken: rawToken,
    expiresAt,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error('token and password are required');
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await PasswordResetToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!record) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  const user = await User.findById(record.user);
  user.password = password;
  await user.save();
  await PasswordResetToken.deleteMany({ user: user._id });

  res.json({ message: 'Password reset successful' });
});

export const profile = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
