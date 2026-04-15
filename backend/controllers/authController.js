import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/error.js';

const normalizeName = (firstName = '', lastName = '') => `${firstName} ${lastName}`.trim();

const userResponse = (user) => ({
  id: user._id,
  name: normalizeName(user.firstName, user.lastName),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isBlocked: user.isBlocked,
  isActive: user.isActive,
  subscription: user.subscription,
  createdAt: user.createdAt,
});

export const signup = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    name,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered.' });

  const [fallbackFirstName, ...rest] = String(name || '').trim().split(' ').filter(Boolean);

  const user = await User.create({
    firstName: firstName || fallbackFirstName || 'User',
    lastName: lastName || rest.join(' ') || 'Account',
    email,
    password,
  });

  const token = signToken({ sub: user._id, role: user.role });
  res.status(201).json({ token, user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const isValid = await user.comparePassword(password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials.' });
  if (user.isBlocked || !user.isActive) return res.status(403).json({ message: 'Account unavailable.' });

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user._id, role: user.role });
  res.json({ token, user: userResponse(user) });
});

export const profile = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !['admin', 'editor'].includes(user.role) || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = signToken({ sub: user._id, role: user.role });
  res.json({ token, admin: userResponse(user) });
});

export const adminProfile = asyncHandler(async (req, res) => {
  if (!['admin', 'editor'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  res.json({ admin: userResponse(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
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
    return res.status(400).json({ message: 'token and password are required' });
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await PasswordResetToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!record) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const user = await User.findById(record.user).select('+password');
  user.password = password;
  await user.save();
  await PasswordResetToken.deleteMany({ user: user._id });

  res.json({ message: 'Password reset successful' });
});
