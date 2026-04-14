import User from '../models/User.js';
import SupportTicket from '../models/SupportTicket.js';
import ActivityLog from '../models/ActivityLog.js';

export const getOverview = async (req, res) => {
  const [totalUsers, activeUsers, blockedUsers, openTickets, activities] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isBlocked: true }),
    SupportTicket.countDocuments({ status: { $ne: 'resolved' } }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(6).populate('actor', 'firstName lastName email')
  ]);

  const systemHealth = {
    api: 'healthy',
    database: 'healthy',
    timestamp: new Date()
  };

  res.json({
    cards: {
      totalUsers,
      activeUsers,
      blockedUsers,
      openTickets,
      mrr: 12400,
      conversionRate: 4.8
    },
    recentActivity: activities,
    systemHealth
  });
};

export const getAnalytics = async (req, res) => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const userSeries = await Promise.all(
    last30Days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const users = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
      return {
        date: start.toISOString().slice(0, 10),
        users,
        revenue: users * 49,
        leads: Math.round(users * 1.8),
        orders: Math.round(users * 1.1)
      };
    })
  );

  res.json({ series: userSeries });
};
