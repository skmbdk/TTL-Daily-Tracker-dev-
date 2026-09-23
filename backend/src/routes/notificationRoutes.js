import express from 'express';
import { getNotifications, getUnreadCount, markAllRead, markRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
