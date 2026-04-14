import mongoose from 'mongoose';
import { ROLES } from '../utils/constants.js';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, enum: Object.values(ROLES), required: true, unique: true },
    permissions: [{ type: String, required: true }],
    description: String,
    isSystem: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Role = mongoose.model('Role', roleSchema);
export default Role;
