import express from 'express';
import { getAnalytics, getOverview } from '../controllers/dashboardController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = express.Router();

router.use(protect);
router.get('/overview', authorizePermissions(PERMISSIONS.VIEW_DASHBOARD), getOverview);
router.get('/analytics', authorizePermissions(PERMISSIONS.VIEW_ANALYTICS), getAnalytics);

export default router;
