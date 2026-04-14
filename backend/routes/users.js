import express from 'express';
import {
  blockUser,
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser
} from '../controllers/userController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';

const router = express.Router();

router.use(protect, authorizePermissions(PERMISSIONS.MANAGE_USERS));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/block', blockUser);
router.post('/:id/reset-password', resetUserPassword);

export default router;
