import express from 'express';
import { submitContact, submitQuote, subscribeNewsletter, getPublicSettings } from '../controllers/publicController.js';

const router = express.Router();

router.post('/contact', submitContact);
router.post('/quote', submitQuote);
router.post('/newsletter', subscribeNewsletter);
router.get('/settings', getPublicSettings);

export default router;
