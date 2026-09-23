import express from 'express';
import {
  getActiveDashboardUsers,
  getAdminActivityCenter,
  getAdminDashboard,
  getUserDashboard
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/admin', protect, requireRole('admin'), getAdminDashboard);
router.get('/activity', protect, requireRole('admin'), getAdminActivityCenter);
router.get('/user', protect, getUserDashboard);
router.get('/active-users', protect, getActiveDashboardUsers);

export default router;
