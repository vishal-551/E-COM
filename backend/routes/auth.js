import express from 'express';
import { adminLogin, adminProfile } from '../controllers/authController.js';
import {
  forgotPassword, login, profile, resetPassword, signup,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.get('/admin/profile', protect, adminProfile);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, profile);

export default router;
