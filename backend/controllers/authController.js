import User from '../models/User.js';
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

export const profile = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});
