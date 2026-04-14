import express from 'express';
import { adminLogin, adminProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.get('/admin/profile', protect, adminProfile);

export default router;
