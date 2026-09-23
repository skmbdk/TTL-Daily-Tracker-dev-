import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('zira_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('zira:logout'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  return error.response?.data?.message || error.message || fallback;
};

export default api;
