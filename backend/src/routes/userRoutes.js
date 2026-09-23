import express from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  getAuditLogs
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/audit-logs', requireRole('admin', 'presenter'), getAuditLogs);
router.route('/').get(requireRole('admin', 'presenter'), getUsers).post(requireRole('admin'), createUser);
router.route('/:id').get(requireRole('admin', 'presenter'), getUserById).put(requireRole('admin'), updateUser).delete(requireRole('admin'), deleteUser);

export default router;
