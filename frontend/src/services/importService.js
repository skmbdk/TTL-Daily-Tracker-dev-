import api, { getErrorMessage } from './api';

export const importService = {
  // Download standard Excel template
  async downloadTemplate() {
    try {
      const response = await api.get('/import/template', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TTL_Agile_Bulk_Import_Template_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Upload and validate Excel file
  async validateFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/import/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data?.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Commit validated data
  async commitImport(validatedData) {
    try {
      const response = await api.post('/import/commit', validatedData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Toggle user import permission
  async toggleUserImportPermission(userId, canImport) {
    try {
      const response = await api.put(`/import/permission/${userId}`, { can_import_excel: canImport });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async toggleUserPermission(userId, canImport) {
    return this.toggleUserImportPermission(userId, canImport);
  }
};
