import { asyncHandler } from '../utils/error.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import QuoteRequest from '../models/QuoteRequest.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import SiteSetting from '../models/SiteSetting.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('name, email, subject and message are required');
  }
  const enquiry = await ContactEnquiry.create(req.body);
  res.status(201).json({ message: 'Enquiry submitted', enquiry });
});

export const submitQuote = asyncHandler(async (req, res) => {
  const { name, email, details } = req.body;
  if (!name || !email || !details) {
    res.status(400);
    throw new Error('name, email and details are required');
  }
  const quote = await QuoteRequest.create(req.body);
  res.status(201).json({ message: 'Quote request submitted', quote });
});

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) return res.json({ message: 'Already subscribed' });

  await NewsletterSubscriber.create({ email });
  res.status(201).json({ message: 'Subscribed successfully' });
});

export const getPublicSettings = asyncHandler(async (_, res) => {
  const settings = await SiteSetting.find();
  const normalized = settings.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
  res.json(normalized);
});
