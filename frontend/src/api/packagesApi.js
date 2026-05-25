import axiosInstance from './axiosInstance';

export const packagesApi = {
  getAll: (params) => axiosInstance.get('/packages', { params }).then(r => r.data),
  getById: (id) => axiosInstance.get(`/packages/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/packages', data).then(r => r.data),
  update: (id, data) => axiosInstance.patch(`/packages/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/packages/${id}`).then(r => r.data),
};
