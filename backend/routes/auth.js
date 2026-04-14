import express from 'express';
import { forgotPassword, login, me, resetPassword, signup } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/signup', validate(['firstName', 'lastName', 'email', 'password']), signup);
router.post('/login', validate(['email', 'password']), login);
router.post('/forgot-password', validate(['email']), forgotPassword);
router.post('/reset-password', validate(['token', 'password']), resetPassword);
router.get('/me', protect, me);

export default router;
