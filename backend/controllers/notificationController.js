import Notification from '../models/Notification.js';

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ notifications });
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  res.json({ notification });
};
