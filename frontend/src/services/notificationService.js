import api from './api';

export const notificationService = {
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }).then((res) => res.data.notifications),
  getUnreadNotificationCount: () =>
    api.get('/notifications/unread-count').then((res) => res.data.unread_count),
  markNotificationRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((res) => res.data.notification),
  markAllNotificationsRead: () =>
    api.patch('/notifications/read-all').then((res) => res.data.updated_count)
};
