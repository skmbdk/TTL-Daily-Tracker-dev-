import express from 'express';
import { exportTasks } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/export', protect, exportTasks);

export default router;
