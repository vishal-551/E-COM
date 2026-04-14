import express from 'express';
import { listNotifications, markRead } from '../controllers/notificationController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = express.Router();

router.use(protect, authorizePermissions(PERMISSIONS.VIEW_NOTIFICATIONS));
router.get('/', listNotifications);
router.patch('/:id/read', markRead);

export default router;
