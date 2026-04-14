import mongoose from 'mongoose';

const uploadAssetSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  resourceType: { type: String, default: 'image' },
  folder: { type: String, default: 'ecom' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('UploadAsset', uploadAssetSchema);
