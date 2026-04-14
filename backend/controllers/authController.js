import Admin from '../models/Admin.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/error.js';

const adminDto = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const admin = await Admin.findOne({ email });
  if (!admin || !admin.isActive || !(await admin.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken({ id: admin._id, role: admin.role });
  res.json({ token, admin: adminDto(admin) });
});

export const adminProfile = asyncHandler(async (req, res) => {
  res.json({ admin: adminDto(req.user) });
});
