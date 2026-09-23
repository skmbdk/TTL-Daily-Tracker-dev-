// 

import { getPool } from '../config/db.js';
import { emitToUser } from '../socket.js';

const clampLimit = (limit) => {
  const parsed = Number(limit || 20);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
};

export const createNotification = async ({ userId, type, title, message = null, relatedTaskId = null }) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      INSERT INTO Notifications (user_id, type, title, message, related_task_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING notification_id, user_id, type, title, message, related_task_id, is_read, created_at
    `,
    [userId, type, title, message, relatedTaskId]
  );

  const notification = result.rows[0];
  emitToUser(userId, 'notification:new', notification);
  return notification;
};

export const getUserNotifications = async (userId, { unreadOnly = false, limit = 20 } = {}) => {
  const pool = await getPool();
  const params = [userId, clampLimit(limit)];
  const unreadFilter = unreadOnly ? 'AND is_read = false' : '';

  const result = await pool.query(
    `
      SELECT notification_id, user_id, type, title, message, related_task_id, is_read, created_at
      FROM Notifications
      WHERE user_id = $1
        ${unreadFilter}
      ORDER BY created_at DESC, notification_id DESC
      LIMIT $2
    `,
    params
  );

  return result.rows;
};

export const getUnreadNotificationCount = async (userId) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      SELECT COUNT(1)::int AS unread_count
      FROM Notifications
      WHERE user_id = $1
        AND is_read = false
    `,
    [userId]
  );

  return result.rows[0]?.unread_count || 0;
};

export const markNotificationRead = async (notificationId, userId) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      UPDATE Notifications
      SET is_read = true
      WHERE notification_id = $1
        AND user_id = $2
      RETURNING notification_id, user_id, type, title, message, related_task_id, is_read, created_at
    `,
    [notificationId, userId]
  );

  return result.rows[0] || null;
};

export const markAllNotificationsRead = async (userId) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      UPDATE Notifications
      SET is_read = true
      WHERE user_id = $1
        AND is_read = false
    `,
    [userId]
  );

  return result.rowCount || 0;
};
