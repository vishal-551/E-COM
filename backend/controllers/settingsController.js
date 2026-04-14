import AppSetting from '../models/AppSetting.js';
import { logActivity } from '../utils/activity.js';

export const getSettings = async (req, res) => {
  const settings = await AppSetting.find().sort({ category: 1, key: 1 });
  res.json({ settings });
};

export const upsertSetting = async (req, res) => {
  const { key, value, category } = req.body;

  const setting = await AppSetting.findOneAndUpdate(
    { key },
    { value, category, updatedBy: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await logActivity({
    actor: req.user._id,
    action: 'settings_changed',
    entityType: 'AppSetting',
    entityId: String(setting._id),
    metadata: { key, category },
    ip: req.ip
  });

  res.json({ setting });
};
