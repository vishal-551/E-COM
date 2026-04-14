import express from 'express';
import { createTicket, listTickets, updateTicket } from '../controllers/supportController.js';
import { authorizePermissions, protect } from '../middleware/auth.js';
import { PERMISSIONS } from '../utils/constants.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, validate(['subject', 'message']), createTicket);
router.get('/', protect, authorizePermissions(PERMISSIONS.MANAGE_SUPPORT), listTickets);
router.patch('/:id', protect, authorizePermissions(PERMISSIONS.MANAGE_SUPPORT), updateTicket);

export default router;
