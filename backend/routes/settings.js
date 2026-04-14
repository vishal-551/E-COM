import express from 'express';
import { getSettings, upsertSetting } from '../controllers/settingsController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = express.Router();

router.use(protect);
router.get('/', authorizePermissions(PERMISSIONS.MANAGE_SETTINGS), getSettings);
router.post('/', authorizePermissions(PERMISSIONS.MANAGE_SETTINGS), upsertSetting);

export default router;
