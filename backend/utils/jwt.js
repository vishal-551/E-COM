import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
