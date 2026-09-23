import api from './api';

export const userService = {
  list: (params) => api.get('/users', { params }).then((res) => res.data.users),
  get: (id) => api.get(`/users/${id}`).then((res) => res.data.user),
  create: (payload) => api.post('/users', payload).then((res) => res.data.user),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((res) => res.data.user),
  remove: (id) => api.delete(`/users/${id}`).then((res) => res.data),
  getAuditLogs: (params) => api.get('/users/audit-logs', { params }).then((res) => res.data)
};
