import express from 'express';
import { listActivity } from '../controllers/activityController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = express.Router();

router.get('/', protect, authorizePermissions(PERMISSIONS.VIEW_ACTIVITY_LOGS), listActivity);

export default router;
