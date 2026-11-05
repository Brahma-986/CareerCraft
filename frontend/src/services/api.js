import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careercraft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');
    const isCredentialAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isCredentialAttempt) {
      localStorage.removeItem('careercraft_token');
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
}

export default api;
