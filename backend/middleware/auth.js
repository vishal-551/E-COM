import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/error.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findById(decoded.id).select('-password');

  if (!admin || !admin.isActive) {
    res.status(401);
    throw new Error('Unauthorized admin');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || user.isBlocked || !user.isActive) {
      return res.status(401).json({ message: 'Account unavailable.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

  req.user = admin;
  next();
});

export const adminOnly = (req, res, next) => {
  if (!['admin', 'editor'].includes(req.user?.role)) {
    res.status(403);
    throw new Error('Admin access required');
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }
  return next();
};

export const authorizePermissions = (...permissions) => (req, res, next) => {
  const hasAll = permissions.every((permission) => req.user.permissions.includes(permission));
  if (!hasAll) {
    return res.status(403).json({ message: 'Missing permission.' });
  }

  return next();
};
