import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../services/notificationService.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true' || req.query.unread_only === 'true';
  const notifications = await getUserNotifications(req.user.user_id, {
    unreadOnly,
    limit: req.query.limit
  });

  return res.json({ notifications });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unread_count = await getUnreadNotificationCount(req.user.user_id);
  return res.json({ unread_count });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.params.id, req.user.user_id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found.' });
  }

  return res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const updated_count = await markAllNotificationsRead(req.user.user_id);
  return res.json({ updated_count });
});
