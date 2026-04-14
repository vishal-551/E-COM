import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS, ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true
    },
    permissions: [{ type: String }],
    isBlocked: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: Date,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    avatarUrl: String,
    company: String,
    phone: String,
    subscription: {
      plan: { type: String, default: 'free' },
      status: { type: String, default: 'trialing', enum: ['trialing', 'active', 'past_due', 'canceled'] },
      expiresAt: Date
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function applyPermissions(next) {
  if (this.isModified('role') || !this.permissions?.length) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
