import express from 'express';
import { heartbeat, login, logout, me, register, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.post('/heartbeat', protect, heartbeat);
router.post('/logout', protect, logout);

export default router;
