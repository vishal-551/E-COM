import SupportTicket from '../models/SupportTicket.js';
import { logActivity } from '../utils/activity.js';

export const createTicket = async (req, res) => {
  const { subject, message, priority } = req.body;
  const ticket = await SupportTicket.create({
    requester: req.user?._id,
    email: req.user?.email || req.body.email,
    subject,
    message,
    priority
  });

  if (req.user) {
    await logActivity({
      actor: req.user._id,
      action: 'support_ticket_created',
      entityType: 'SupportTicket',
      entityId: String(ticket._id),
      ip: req.ip
    });
  }

  res.status(201).json({ ticket });
};

export const listTickets = async (req, res) => {
  const tickets = await SupportTicket.find().sort({ createdAt: -1 }).populate('requester', 'firstName lastName email');
  res.json({ tickets });
};

export const updateTicket = async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ticket });
};
