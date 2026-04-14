import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

router.get('/', asyncHandler(async (_, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json(settings);
}));

router.put('/', protect, adminOnly, asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create(req.body);
  else Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
}));

export default router;
