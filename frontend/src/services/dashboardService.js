import api from './api';

export const dashboardService = {
  admin: () => api.get('/dashboard/admin').then((res) => res.data),
  user: () => api.get('/dashboard/user').then((res) => res.data),
  activity: () => api.get('/dashboard/activity').then((res) => res.data),
  activeUsers: () => api.get('/dashboard/active-users').then((res) => res.data.active_users || [])
};
