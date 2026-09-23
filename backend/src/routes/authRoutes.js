import express from 'express';
import { heartbeat, login, logout, me, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, me);
router.post('/heartbeat', protect, heartbeat);
router.post('/logout', protect, logout);

export default router;
