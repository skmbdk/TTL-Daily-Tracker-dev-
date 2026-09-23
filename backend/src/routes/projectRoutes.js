import express from 'express';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getProjects).post(requireRole('admin'), createProject);
router.route('/:id').put(requireRole('admin'), updateProject).delete(requireRole('admin'), deleteProject);

export default router;
