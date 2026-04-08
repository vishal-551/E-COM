import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'E-COM Store' },
  homeText: { type: String, default: 'Welcome to our store' },
  aboutText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  heroImages: [{ type: String }],
  thumbnails: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
