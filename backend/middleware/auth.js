import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.sub;
    const user = await User.findById(userId).select('-password');

    if (!user || user.isBlocked || !user.isActive) {
      return res.status(401).json({ message: 'Account unavailable.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!['admin', 'editor'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }
  return next();
};

export const authorizePermissions = (...permissions) => (req, res, next) => {
  const userPermissions = req.user?.permissions || [];
  const hasAll = permissions.every((permission) => userPermissions.includes(permission));
  if (!hasAll) {
    return res.status(403).json({ message: 'Missing permission.' });
  }

  return next();
};
