import api from './api';

export const projectService = {
  list: () => api.get('/projects').then((res) => res.data.projects),
  create: (payload) => api.post('/projects', payload).then((res) => res.data.project),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((res) => res.data.project),
  remove: (id) => api.delete(`/projects/${id}`).then((res) => res.data)
};
