import api from './api';

export const reportService = {
  exportTasks: (params) =>
    api
      .get('/reports/export', { params, responseType: 'blob' })
      .then((res) => ({
        blob: res.data,
        fileName: getFileName(res.headers['content-disposition'])
      }))
};

const getFileName = (contentDisposition) => {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] || `task-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
};
