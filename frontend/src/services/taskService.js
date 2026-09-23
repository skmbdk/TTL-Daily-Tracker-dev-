import api from './api';

export const taskService = {
  list: (params) => api.get('/tasks', { params }).then((res) => res.data.tasks),
  listWithMeta: (params) => api.get('/tasks', { params }).then((res) => res.data),
  get: (id) => api.get(`/tasks/${id}`).then((res) => res.data),
  create: (payload) => api.post('/tasks', payload).then((res) => res.data.task),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then((res) => res.data.task),
  remove: (id) => api.delete(`/tasks/${id}`).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then((res) => res.data.task),
  updatePriority: (id, priority) => api.patch(`/tasks/${id}/priority`, { priority }).then((res) => res.data.task),
  addRemark: (id, payload) => api.post(`/tasks/${id}/remarks`, payload).then((res) => res.data.remark),
  updateRemark: (id, remarkId, payload) => api.put(`/tasks/${id}/remarks/${remarkId}`, payload).then((res) => res.data.remark),
  deleteRemark: (id, remarkId) => api.delete(`/tasks/${id}/remarks/${remarkId}`).then((res) => res.data),
  remarks: (id) => api.get(`/tasks/${id}/remarks`).then((res) => res.data.remarks),
  addComment: (id, comment_text, parent_comment_id = null) =>
    api.post(`/tasks/${id}/comments`, { comment_text, parent_comment_id }).then((res) => res.data.comment),
  updateComment: (id, commentId, comment_text) =>
    api.put(`/tasks/${id}/comments/${commentId}`, { comment_text }).then((res) => res.data.comment),
  deleteComment: (id, commentId) =>
    api.delete(`/tasks/${id}/comments/${commentId}`).then((res) => res.data),
  comments: (id) => api.get(`/tasks/${id}/comments`).then((res) => res.data.comments),
  getAttachments: (id) => api.get(`/tasks/${id}/attachments`).then((res) => res.data.attachments),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then((res) => res.data.attachment);
  },
  downloadAttachment: (attachmentId, originalName) => {
    return api.get(`/tasks/attachments/${attachmentId}/download`, { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },
  addLinkAttachment: (id, payload) => api.post(`/tasks/${id}/attachments/link`, payload).then((res) => res.data.attachment),
  deleteAttachment: (attachmentId) => api.delete(`/tasks/attachments/${attachmentId}`).then((res) => res.data)
};
