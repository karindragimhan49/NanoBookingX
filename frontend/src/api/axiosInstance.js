import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('gt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gt_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
