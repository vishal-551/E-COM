import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/error.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    res.status(401);
    throw new Error('Unauthorized: token missing');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findById(decoded.id).select('-password');

  if (!admin || !admin.isActive) {
    res.status(401);
    throw new Error('Unauthorized admin');
  }

  req.user = admin;
  next();
});

export const adminOnly = (req, res, next) => {
  if (!['admin', 'editor'].includes(req.user?.role)) {
    res.status(403);
    throw new Error('Admin access required');
  }
  next();
};
