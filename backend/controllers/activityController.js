import ActivityLog from '../models/ActivityLog.js';

export const listActivity = async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200).populate('actor', 'firstName lastName email role');
  res.json({ logs });
};
