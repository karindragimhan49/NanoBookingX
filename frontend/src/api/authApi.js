import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data).then(r => r.data),
  login: (data) => axiosInstance.post('/auth/login', data).then(r => r.data),
  getMe: () => axiosInstance.get('/auth/me').then(r => r.data),
  getAllUsers: () => axiosInstance.get('/auth/users').then(r => r.data),
  updateUser: (id, data) => axiosInstance.patch(`/auth/users/${id}`, data).then(r => r.data),
};
